import { decodedDoiUrlString } from "../doi/url.ts";
import type { Publication } from "./pub_types.ts";
import type { SlimPublication } from "../slim/types.ts";
export const pubFromSlim = (slim: SlimPublication) => {
  const pub: Publication = structuredClone({
    id: decodedDoiUrlString(slim.doi),
    ...slim,
    reg: "Crossref",
  });
  return pub;
};
