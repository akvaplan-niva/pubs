import { fetchNvaJson } from "./api.ts";
import { NvaSeries } from "./types.ts";

export const getSeries = async (id: string | URL) =>
  await fetchNvaJson<NvaSeries>(id);
