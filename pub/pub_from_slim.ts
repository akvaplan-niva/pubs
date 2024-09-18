import { doiUrlString } from "../doi/url.ts";
import type { Pub } from "./types.ts";
import type { SlimPublication } from "../slim/types.ts";
export const pubFromSlim = (slim: SlimPublication) => {
  const pub: Pub = structuredClone({
    id: doiUrlString(slim.doi),
    ...slim,
    reg: "Crossref",
    created: new Date(),
    modified: new Date(),
  });
  return pub;
};
