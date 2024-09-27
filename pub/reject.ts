import { kv } from "../kv/kv.ts";

export const isRejected = async (id: string) => {
  const ignore = new Set([
    // These are non-existing (typos):
    "https://doi.org/10.1098/rspb.2020.1001rspb20201001",
    "https://doi.org/10.5324/fn.v31i0.1506",
    "https://doi.org/10.1016/j.aquaculture.2006.06",
    "https://doi.org/10.1016/j.pocean.2006.10.0",
  ]);
  if (ignore.has(id)) {
    return true;
  }
  const { versionstamp } = await kv.get(["reject", id]);
  return versionstamp ? true : false;
};
