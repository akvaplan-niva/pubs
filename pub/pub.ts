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
import { doiName, doiUrlString, isDoiUrl } from "../doi/url.ts";
import { NvaPublication } from "../nva/types.ts";
import { pubFromNva } from "./pub_from_nva.ts";

import { identify } from "../akvaplanists/identify.ts";
import { getCrossrefWorkFromApi } from "../crossref/work.ts";
import { isRejected } from "./reject.ts";

const pubkey = (pub: Pick<Pub, "id">) => ["pub", pub.id] as const;

export const ids = async () =>
  new Set(
    (await Array.fromAsync(keys({ prefix: ["pub"] })))
      .map(([, id]) => id as string),
  );

export const doiset = async () =>
  new Set([...(await ids())].filter((id) => isDoiUrl(id)));

export const doinames = async () =>
  new Set([...(await doiset())].map((url) => doiName(url)));

export const deletePub = async (id: string, opts: { by: boolean }) => {
  const pub = await getPub(id);
  if (pub) {
    await kv.delete(pubkey({ id }));
  }
  // deleteCrossref
  // deleteNva
  if (
    id.startsWith(
      "https://api.test.nva.aws.unit.no/publication",
    )
  ) {
    const nva = id.split("/").at(-1);
    console.warn("DELETE", ["nva", nva]);
    await kv.delete(["nva", nva]);
  }

  // Delete from "by"
  if (opts.by) {
    if (pub) {
      const identities = pub?.authors.filter((a) => "identity" in a).map((a) =>
        a.identity
      );
      console.warn(pub.id, identities);
      // loop authors an delete by identity pub.id
      throw id;
    } else {
      console.warn(
        `WARN: FIXME inefficient algo, looping KV prefix ["by"] for already deleted pub ${id}`,
      );
      const by = kv.list({ prefix: ["by"] });
      for await (const { key } of by) {
        const match = key.at(2) === id;
        if (match) {
          console.warn("DELETE", key);
          await kv.delete(key);
        }
      }
    }
  }
};
export const getPub = async (id: string) => {
  if (!await isRejected(id)) {
    return (await kv.get<Pub>(pubkey({ id })))?.value;
  }
};
export const insertDoiPub = (
  { doi, reg, add }: DoiRegObject & { add?: Partial<Pub> },
) => {
  switch (reg) {
    case "Crossref":
      return insertPubFromCrossrefDoi(doi, add);
    case "DataCite":
      return insertPubFromDatacite(doi, add);
    default:
      throw new RangeError(`Unsupported DOI registration agency: ${reg}`);
  }
};

export const insertNvaPub = async (nvapub: NvaPublication) => {
  const pub = await pubFromNva(nvapub);
  const { doi, nva } = pub;
  if (nva) {
    if (JSON.stringify(nvapub).length < 65535) {
      await kv.set(["nva", nva], nvapub);
    } else {
      kv.set(["nva-error", nva], { error: "Metadata size > 65535 bytes" });
    }
  }

  // Does pub have DOI?
  if (doi) {
    console.assert(
      doiName(doi) === doiUrlString(pub.id),
      `Pub id (${pub.id}) and doi (${doi}) mismatch`,
    );
    const existing = await getPub(pub.id);
    if (existing && existing?.nva !== nva) {
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
      // FIXME: stop guessing registry!
      await insertDoiPub({ doi, reg: "Crossref", add: { nva } });
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

const setAtomicBys = (pub: Pub, atomic: Deno.AtomicOperation) => {
  for (const author of pub.authors) {
    const { identity } = author;
    if (identity && identity.id) {
      const key = ["by", identity.id, pub.id];
      atomic.set(key, pub);
    }
  }
  return atomic;
};

export const insertPubs = async (pubs: Pub[]) => {
  for await (const pub of pubs) {
    await insertPub(pub);
  }
};

const augmentPub = async (pub: Pub) => {
  const aug = structuredClone(pub);
  const authors = await findIdentities(aug.authors);

  aug.authors = authors;

  if (aug.contributors && aug.contributors?.length > 0) {
    aug.contributors = await findIdentities(aug.contributors);
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
    const final = setAtomicBys(value, atomic);
    return await final.commit();
  }
};

export const updatePub = async (
  pub: Pub,
) => {
  const res = await prepareAtomicSetPub(pub);
  if (res) {
    const { value, atomic } = res;
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
  doi: string,
  _add?: Partial<Pub>,
) => {
  await console.warn(
    "WARN",
    `Cannot insert "${doi}": DataCite DOIs are not yet supported`,
  );
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
