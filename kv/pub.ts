import { kv } from "./kv.ts";
import { getOrLookupCrossrefWork, setCrossrefWork } from "./crossref.ts";
import type { DoiRegObject, Publication } from "../pub/pub_types.ts";

import { pubFromCrossrefWork } from "../pub/pub_from_crossref.ts";
import { validatePub } from "../pub/validate_pub.ts";

const pubkey = (pub: Publication | Pick<Publication, "id">) => ["pub", pub.id];

/** Get pub from KV */
export const getPub = async (id: string) =>
  (await kv.get<Publication>(pubkey({ id })))?.value;

/**
 * Insert a new DOI publication
 */
export const insertDoiPub = (
  { doi, reg }: DoiRegObject,
) => {
  switch (reg) {
    case "Crossref":
      return insertCrossrefPub(doi);
    case "DataCite":
      return insertDatacite(doi);
    default:
      throw new RangeError(`Unsupported DOI registration agency: ${reg}`);
  }
};

/** Insert pub in KV */
export const insertPub = async (pub: Publication) =>
  await kv.atomic()
    .check({ key: pubkey(pub), versionstamp: null })
    .set(pubkey(pub), pub)
    .commit();

/** Store publicaton in KV */
export const setPub = async (pub: Publication) =>
  await kv.set(pubkey(pub), pub);

const insertCrossrefPub = async (doi: string) => {
  const work = await getOrLookupCrossrefWork(doi);
  if (work) {
    await setCrossrefWork(work); // persist crossref work
    const pub = pubFromCrossrefWork(work);

    const cause = await validatePub(pub);
    if (cause) {
      throw RangeError("Publication failed validation", { cause });
    }

    const pubkv = await getPub(pub.id);
    if (!pubkv) {
      const { id, published, title, license } = pub;
      console.warn("INFO", "insert", { id, published, license, title });
      await insertPub(pub);
    }
    await putPubInDoisDenoDev(pub);
  }
};

const insertDatacite = async (doi: string) => {
  await console.warn(
    "WARN",
    `Cannot insert "${doi}": DataCite DOIs are not yet supported`,
  );
};

const putPubInDoisDenoDev = async (pub: Publication) => {
  const url = new URL(pub.id);
  url.hostname = "dois.deno.dev";
  url.pathname = `/doi${url.pathname}`;
  const r = await fetch(url);
  if (r.status === 404 && Deno.env.has("DOIS_DENO_BASIC")) {
    const authorization = Deno.env.get("DOIS_DENO_BASIC") ?? "";
    const r = await fetch(url, {
      method: "PUT",
      body: JSON.stringify(pub),
      headers: { authorization },
    });
    console.warn(r, await r.text());
  }
};
