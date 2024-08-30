import { keys, kv } from "./kv.ts";
import {
  crossrefkey,
  getOrLookupCrossrefWork,
  setCrossrefWork,
} from "./crossref.ts";
import type { DoiRegObject, Pub } from "../pub/pub_types.ts";

import { pubFromCrossrefWork } from "../pub/pub_from_crossref.ts";
import { validatePub } from "../pub/validate_pub.ts";
import { doiname, isDoiUrl } from "../doi/url.ts";

const pubkey = (pub: Pub | Pick<Pub, "id">) => ["pub", pub.id] as const;

const countkey = ["count", "pub"] as const;

/** Get pub from KV */
export const getPub = async (id: string) =>
  (await kv.get<Pub>(pubkey({ id })))?.value;

/**
 * Insert a new DOI publication
 */
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

/** Insert pub in KV */
export const insertPub = async (pub: Pub) => {
  const cause = await validatePub(pub);
  if (cause) {
    throw RangeError("Publication failed validation", { cause });
  }
  const atomic = kv.atomic()
    .check({ key: pubkey(pub), versionstamp: null })
    .set(pubkey(pub), pub)
    .mutate({
      type: "sum",
      key: countkey,
      value: new Deno.KvU64(1n),
    });

  switch (pub.reg) {
    case "Crossref": {
      const key = crossrefkey(pub.doi as string);
      const { versionstamp } = await kv.get(key);
      return await atomic.check({ key, versionstamp }).commit();
    }
    default:
      return await atomic.commit();
  }
};

/** Store publicaton in KV */
export const setPub = async (pub: Pub) => await kv.set(pubkey(pub), pub);

/** Lookup Crossref DOI and insert both work and pub  */
const insertPubFromCrossrefDoi = async (doi: string) => {
  const work = await getOrLookupCrossrefWork(doi);
  if (work) {
    await setCrossrefWork(work); // persist crossref work
    const pub = pubFromCrossrefWork(work);
    const pubkv = await getPub(pub.id);
    if (!pubkv) {
      const { id, published, title, license } = pub;
      console.warn("INFO", "insert", { id, published, license, title });
      await insertPub(pub);
    }
  }
};

const insertPubFromDatacite = async (_doi: string) => {
  // await console.warn(
  //   "WARN",
  //   `Cannot insert "${doi}": DataCite DOIs are not yet supported`,
  // );
};

export const dois = async () =>
  new Set(
    (await Array.fromAsync(keys({ prefix: ["pub"] })))
      .map(([, id]) => id as string).filter((id) => isDoiUrl(id)),
  );

export const doinames = async () =>
  new Set([...(await dois())].map((url) => doiname(url)));
