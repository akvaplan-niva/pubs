#!/usr/bin/env -S deno run --env-file --allow-env --allow-read --allow-net
import { keys, kv } from "../kv/kv.ts";
import {
  getCrossrefWork,
  getOrLookupCrossrefWork,
  insertCrossrefWork,
  setCrossrefWork,
} from "../kv/crossref.ts";
import type { DoiRegObject, Pub, PubContributor } from "./types.ts";

import { pubFromCrossrefWork } from "./pub_from_crossref.ts";
import { validatePub } from "./validate_pub.ts";
import {
  doiName,
  doiUrlString,
  getRegistrar,
  isDoiName,
  isDoiUrl,
} from "../doi/url.ts";
import { NvaPublication } from "../nva/types.ts";
import { pubFromNva } from "./pub_from_nva.ts";

import { identify } from "../akvaplanists/identify.ts";
import { getCrossrefWorkFromApi } from "../crossref/work.ts";
import { isRejected } from "./reject.ts";
import { ndjson } from "../util/ndjson.ts";
import { patchInOpenAccessMetadataToPub } from "../openalex/api.ts";
import { isHandleUrl } from "./handle.ts";
import { nvaCristinPersonUrl } from "../nva/cristin_person.ts";
import { nvaPubUrl } from "../nva/api.ts";

const pubkey = (pub: Pick<Pub, "id">) => ["pub", pub.id] as const;

export const listKvPubs = () => kv.list<Pub>({ prefix: ["pub"] });

export const ids = async () =>
  new Set(
    (await Array.fromAsync(keys({ prefix: ["pub"] })))
      .map(([, id]) => id as string),
  );

export const doiset = async () =>
  new Set([...(await ids())].filter((id) => isDoiUrl(id)));

export const handleset = async () =>
  new Set([...(await ids())].filter((id) => isHandleUrl(id)));

export const doinames = async () =>
  new Set([...(await doiset())].map((url) => doiName(url)));

export const deletePub = async (pubid: string) => {
  const pub = await getPub(pubid);
  if (pub) {
    const at = kv.atomic();

    const key = pubkey({ id: pub.id });
    const rejectkey = ["reject", pub.id];

    console.warn(`DELETE`, key, `SET`, rejectkey);

    const atomic = at
      .delete(key)
      .set(rejectkey, { deleted: new Date().toJSON() });

    const { nva, reg, doi } = pub;
    if (nva) {
      const nvakey = ["nva", nva];
      console.warn(`DELETE`, nvakey);
      atomic.delete(nvakey);
    }

    if (doi && "Crossref" === reg) {
      const crossrefkey = ["crossref", doi];
      console.warn(`DELETE`, crossrefkey);
      atomic.delete(crossrefkey);
    }
    await _deleteIdentities(pub);
    return await atomic.commit();
  }
};

export const _deleteIdentities = async (pub) => {
  const identities = pub?.authors.filter((a) => "identity" in a).map((
    { identity },
  ) => identity?.id!).filter((id) => id !== undefined);
  console.warn(identities);

  if (identities && identities?.length > 0) {
    // loop authors an delete by identity pub.id
    const atomic = kv.atomic();
    for await (const akvaplanist of identities) {
      const key = ["by", akvaplanist, pub.id];
      console.warn("DELETE", key);
      atomic.delete(key);
    }
    await atomic.commit();
  }
  // else {
  //   console.warn(
  //     `WARN: Inefficient loop of KV prefix ["by"] for already deleted pub ${pubid}`,
  //   );
  //   const by = kv.list({ prefix: ["by"] });
  //   for await (const { key } of by) {
  //     const match = key.at(2) === pubid;
  //     if (match) {
  //       console.warn("DELETE", key);
  //       await kv.delete(key);
  //     }
  //   }
  // }
};
export const getPub = async (id: string) => {
  if (!await isRejected(id)) {
    return (await kv.get<Pub>(pubkey({ id })))?.value;
  }
};
export const getPubAndReidentify = async (id: string) => {
  const pub = await getPub(id);
  if (pub) {
    return augmentPub(pub);
  }
};

export const insertDoiPub = (
  { doi, reg, add }: DoiRegObject & { add?: Pub | Partial<Pub> },
) => {
  switch (reg) {
    case "Crossref":
      return insertPubFromCrossrefDoi(doi, add);
    case "DataCite":
      return insertPubFromDatacite(doi, add as Pub);
    default:
      throw new RangeError(`Unsupported DOI registration agency: ${reg}`);
  }
};

export const insertNvaPub = async (nvapub: NvaPublication) => {
  const pub = await pubFromNva(nvapub);

  const { id, nva } = pub;
  console.warn("insertNvaPub", nva, pub);
  if (nva) {
    if (JSON.stringify(nvapub).length < 65535) {
      await kv.set(["nva", nva], nvapub);
    } else {
      kv.set(["nva-error", nva], { error: "Metadata size > 65535 bytes" });
    }
  }

  // Does pub have DOI?
  if (isDoiUrl(id)) {
    // When DOI is added later
    if (nva) {
      const nvaid = nvaPubUrl(nva).href;
      const alreadyInUnderNvaId = await getPub(nvaid);
      console.warn(alreadyInUnderNvaId);
      // @todo FIXME DELETE to avoid dup when DOI is added later
      // await kv.delete(["pub", nvaid]);
    }

    const doi = doiName(id);
    pub.doi = doi;

    const existing = await getPub(pub.id);
    if (existing && existing?.nva !== nva) {
      // Example: Updating existing KV pub 10.3389/fenvs.2021.662168 with nva id 01907a9f8b3c-adae035b-97f4-428c-af0a-d6f78b3c31c4 was 01907a754a97-1e0b1c8f-8ae0-4dab-8bb6-3feb2a57e72a
      console.warn(
        "Updating existing KV pub",
        doi,
        "with nva id",
        nva,
        "was",
        existing.nva,
      );
      existing.nva = nva;
      await updatePub(existing);
    } else {
      // If DOI, use Crossref metadata, but add NVA id; useful to find PDF and to lookup parents and siblings for book chapters like https://doi.org/10.26530/oapen_627870 => https://test.nva.sikt.no/registration/01907a80beda-b1a7fe47-42b8-4fa1-8898-783543242ddd
      const reg = await getRegistrar(doi);
      console.warn({ reg });
      const { agency } = reg ?? {};
      if (agency) {
        await insertDoiPub({ doi, reg: agency, add: { ...pub } });
      } else {
        console.error("No DOI registration agency found for", doi);
      }
    }
  } else {
    await insertPub(pub);
  }
};

export const findIdentities = async (contributors: PubContributor[]) => {
  let pos = 0;
  for await (const contrib of contributors) {
    const identity = await identify(contrib);
    if (identity) {
      contrib.identity = identity;
    }
    contrib.position = pos > 0 && pos + 1 === contributors.length ? -1 : pos;
    pos++;
  }
  return contributors;
};

export const setAtomicNvaCristinProjectRelPub = (
  pub: Pub,
  at: Deno.AtomicOperation,
) => {
  const { projects } = pub;
  if (
    projects && projects?.length > 0 &&
    projects.some(({ cristin }) => cristin! > 0)
  ) {
    for (const p of projects) {
      const key = [
        "cristinproject_pub",
        Number(p.cristin),
        String(pub.id),
      ];
      at.set(key, pub);
    }
  }
  return at;
};

const setAtomicBys = (pub: Pub, atomic: Deno.AtomicOperation) => {
  const id = pub.id.toLowerCase();
  for (const author of pub.authors) {
    const { identity } = author;
    if (identity && identity.id) {
      const key = ["by", identity.id, id];
      atomic.set(key, pub);
    }
  }
  if (pub.contributors && pub.contributors.length > 0) {
    for (const author of pub.contributors) {
      const { identity } = author;
      if (identity && identity.id) {
        const key = ["by", identity.id, id];
        atomic.set(key, pub);
      }
    }
  }
  return setAtomicNvaCristinProjectRelPub(pub, atomic);
};

export const insertPubs = async (pubs: Pub[]) => {
  for await (const pub of pubs) {
    await insertPub(pub);
  }
};

// deno-lint-ignore no-unused-vars
const wipePreviusIdentities = ({ identity, ...a }: PubContributor) => a;

const augmentPub = async (pub: Pub) => {
  pub = structuredClone(pub);
  if (isDoiUrl(pub.id) && !isDoiName(pub.doi)) {
    pub.doi = doiName(pub.id);
  }
  const aug = await patchInOpenAccessMetadataToPub(pub);

  const authors = await findIdentities(
    //remove previously identified in order to wipe mis-identifications
    aug.authors.map(wipePreviusIdentities),
  );

  aug.authors = authors;

  if (aug.contributors && aug.contributors?.length > 0) {
    aug.contributors = await findIdentities(
      aug.contributors.map(wipePreviusIdentities),
    );
    aug.akvaplanists = countAkvaplanists([...aug.authors, ...aug.contributors]);
  } else {
    aug.akvaplanists = countAkvaplanists(authors);
  }

  if (pub?.doi && pub?.reg === "Crossref") {
    const work = await getCrossrefWork(pub.doi);
    if (!work) {
      const work2 = await getCrossrefWorkFromApi(pub.doi);
      if (work2) {
        await insertCrossrefWork(work2);
      }
    }
  }
  // FIXME Metadata from NVA may contain only 10 first authors; triggering false warnings of 0 Akvaplanists
  // This bites for non-DataCite DOIs like https://doi.org/10.5281/zenodo.7092586 – see https://pubs.deno.dev/pub/10.5281/zenodo.7092586
  if (0 === aug.akvaplanists.total && aug.authors?.length > 0) {
    console.warn(
      "Found 0 Akvaplanists in",
      pub.id,
      "authors:",
      JSON.stringify(aug.authors),
    );
  }
  return aug;
};

const prepareAtomicSetPub = async (
  pub: Pub,
) => {
  const rejected = await isRejected(pub.id);
  if (rejected) {
    return;
  }
  if (pub.title === "") {
    pub.title = pub.id;
  }
  if (!pub.authors) {
    pub.authors = [];
  }
  const cause = await validatePub(pub);
  if (cause) {
    console.error({ cause, pub });
    throw RangeError(`Invalid publication: ${pub.id}`, { cause });
  }

  const key = pubkey(pub);
  const value = await augmentPub(pub);
  const atomic = kv.atomic().set(key, value);

  return { key, value, atomic };
};

export const insertPub = async (
  pub: Pub,
) => {
  const res = await prepareAtomicSetPub(pub);
  if (res) {
    const { key, value, atomic } = res;
    atomic.check({ key, versionstamp: null });
    const final = setAtomicBys(value, atomic)!;
    return await final.commit();
  }
};

export const updatePub = async (
  pub: Pub,
  versionstamp?: string,
) => {
  const res = await prepareAtomicSetPub(pub);
  if (res) {
    const { value, atomic } = res;
    if (versionstamp) {
      const key = ["pub", pub.id.toLowerCase()];
      atomic.check({ key, versionstamp });
    }
    const final = setAtomicBys(value, atomic);
    return await final.commit();
  }
};

// export const setPubCount = async (n: number) =>
//   await kv.set(["count", "pub"], new Deno.KvU64(BigInt(n)));

/** Insert pub from DOI name (by retrieving Crossref work metadata)  */
const insertPubFromCrossrefDoi = async (doi: string, add?: Partial<Pub>) => {
  const name = isDoiUrl(doi) ? doiName(doi) : doi;
  const work = await getOrLookupCrossrefWork(name);
  if (work) {
    await setCrossrefWork(work); // save crossref work
    const pubFromWork = pubFromCrossrefWork(work);
    const pub = add ? { ...pubFromWork, ...add } : pubFromWork;
    await insertPub(pub);
  }
};

const insertPubFromDatacite = async (
  _doi: string,
  add?: Pub,
) => {
  if (!add) {
    throw new RangeError(
      `Cannot insert DataCite DOI without additional metadata`,
    );
  }
  add.reg = "DataCite";
  await insertPub(add);
};

export const findChangedTitles = async () => {
  const existing = await Array.fromAsync(
    kv.list<Pub>({ prefix: ["pub"] }),
  );
  if (existing) {
    const titles = new Map(
      existing.map(({ value }) => [value.doi as string, value.title]),
    );
    const diff = new Set();
    for await (const [doi, title] of titles) {
      const work = await getOrLookupCrossrefWork(doi);
      if (work) {
        if (title !== work.title.at(0)) {
          diff.add(doi);
          console.warn(diff);
        }
      }
    }
  }
};

const countAkvaplanists = (contribs: PubContributor[]) => {
  const akvaplanists = { total: 0, current: 0, prior: 0, when: new Date() };
  for (const contrib of contribs) {
    const { identity } = contrib;
    if (identity) {
      akvaplanists.total++;
      if (identity.prior === true) {
        akvaplanists.prior++;
      } else {
        akvaplanists.current++;
      }
    }
  }
  return akvaplanists;
};

if (import.meta.main) {
  const [id, action, text] = Deno.args;
  if (id) {
    switch (action) {
      case "delete": {
        ndjson(await deletePub(id));
        break;
      }

      case "put":
      case "set": {
        const pub = JSON.parse(text);
        ndjson(await updatePub(pub));
        break;
      }
      case "get":
      default:
        ndjson(await getPub(id));
    }
  }
}
