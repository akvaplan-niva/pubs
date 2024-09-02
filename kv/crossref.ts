import { CrossrefWork } from "../crossref/types.ts";
import { workFromApi } from "../crossref/work.ts";
import { kv } from "./kv.ts";

export const crossrefkey = (doi: string) =>
  ["crossref", doi.toLowerCase()] as const;

export const deleteCrossrefWork = async (doi: string) =>
  await kv.delete(crossrefkey(doi));

export const getCrossrefWork = async (doi: string) => {
  const key = crossrefkey(doi);
  const { value } = await kv.get<CrossrefWork>(key);
  return value;
};

/**
 * Get Crossref work from KV, with fallback to API
 */
export const getOrLookupCrossrefWork = async (
  doi: string,
  opts?: { ref: boolean },
) => {
  const key = crossrefkey(doi);
  const { versionstamp, value } = await kv.get<CrossrefWork>(key);
  if (versionstamp) {
    return value;
  } else {
    const work = await workFromApi(doi);
    if (work) {
      if (opts && opts.ref === true) {
        return work;
      }
      work.reference = [];
      return work;
    }
  }
};
/**
 * Store Crossref work in KV (without references)
 */
export const setCrossrefWork = async (work: CrossrefWork) => {
  const key = crossrefkey(work.DOI);
  work.reference = [];
  return await kv.set(key, work);
};
