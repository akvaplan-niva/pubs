import { keys, kv } from "./kv.ts";
import {
  getCrossrefWork,
  getOrLookupCrossrefWork,
  insertCrossrefWork,
  setCrossrefWork,
} from "./crossref.ts";
import type { DoiRegObject, Pub, PubAuthor } from "../pub/types.ts";

import { pubFromCrossrefWork } from "../pub/pub_from_crossref.ts";
import { validatePub } from "../pub/validate_pub.ts";
import { doiname, isDoiUrl } from "../doi/url.ts";
import { NvaPublication } from "../nva/types.ts";
import { pubFromNva } from "../pub/pub_from_nva.ts";

import { identify } from "../akvaplanists/spelling.ts";
import { getCrossrefWorkFromApi } from "../crossref/work.ts";

const pubkey = (pub: Pick<Pub, "id">) => ["pub", pub.id] as const;

export const idset = async () =>
  new Set(
    (await Array.fromAsync(keys({ prefix: ["pub"] })))
      .map(([, id]) => id as string),
  );

export const doiset = async () =>
  new Set([...(await idset())].filter((id) => isDoiUrl(id)));

export const doinameset = async () =>
  new Set([...(await doiset())].map((url) => doiname(url)));

export const deletePub = async (id: string) => await kv.delete(pubkey({ id }));

export const getPub = async (id: string) =>
  (await kv.get<Pub>(pubkey({ id })))?.value;

export const insertDoiPub = (
  { doi, reg }: DoiRegObject,
) => {
  switch (reg) {
    case "Crossref":
      return insertPubFromCrossrefDoi(doi);
    case "DataCite":
      return insertPubFromDatacite(doi);
    default:
      throw new RangeError(`Unsupported DOI registration agency: ${reg}`);
  }
};

export const insertNvaPub = async (nvapub: NvaPublication) => {
  const pub = await pubFromNva(nvapub);
  await insertPub(pub);
};

export const findAuthorIdentities = async (pub: Pub) => {
  const authors = structuredClone(pub?.authors ?? []);
  let pos = 0;
  for await (const author of authors) {
    const identity = await identify(author);
    if (identity) {
      author.identity = identity;
    }
    author.position = pos > 0 && pos + 1 === authors.length ? -1 : pos;
    pos++;
  }
  return authors;
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
  aug.authors = await findAuthorIdentities(aug);
  aug.akvaplanists = countAkvaplanists(aug.authors);

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
      JSON.stringify(pub.authors),
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
    //Rare, but Crossref title may sometimes be empty
    pub.title = pub.id;
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
const insertPubFromCrossrefDoi = async (doi: string) => {
  const work = await getOrLookupCrossrefWork(doi);
  if (work) {
    await setCrossrefWork(work); // save crossref work
    const pub = pubFromCrossrefWork(work);
    await insertPub(pub);
  }
};

const insertPubFromDatacite = async (_doi: string) => {
  // await console.warn(
  //   "WARN",
  //   `Cannot insert "${doi}": DataCite DOIs are not yet supported`,
  // );
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

const isRejected = async (id: string) => {
  const ignore = new Set([
    "https://doi.org/10.1098/rspb.2020.1001rspb20201001",
    "https://doi.org/10.5324/fn.v31i0.1506",
    "https://doi.org/10.1016/j.aquaculture.2006.06",
    "https://doi.org/10.1016/j.pocean.2006.10.0",
    //"https://doi.org/10.4194/1303-2712-v16_2_06", //invalid
  ]);
  if (ignore.has(id)) {
    return true;
  }
  const { versionstamp } = await kv.get(["reject", id]);
  return versionstamp ? true : false;
};

const countAkvaplanists = (authors: PubAuthor[]) => {
  const akvaplanists = { total: 0, current: 0, prior: 0, when: new Date() };
  for (const author of authors) {
    const { identity } = author;
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
