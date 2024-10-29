#!/usr/bin/env -S deno run --env-file --allow-env --allow-net

import { doiName, isDoiName, isDoiUrl } from "../doi/url.ts";
import { getCrossrefWork } from "../kv/crossref.ts";
import { getNvaPublication } from "../nva/api.ts";
import { pubFromCrossrefWork } from "./pub_from_crossref.ts";
import { pubFromNva } from "./pub_from_nva.ts";

const ndjson = (o: unknown) => console.log(JSON.stringify(o));

const crossref = async (params: string[]) => {
  const [_doi] = params;
  const doi = isDoiName(_doi)
    ? _doi
    : isDoiUrl(_doi)
    ? doiName(_doi)
    : undefined;
  if (doi) {
    const work = await getCrossrefWork(doi);
    if (work) {
      const pub = pubFromCrossrefWork(work);
      ndjson(pub);
    }
  }
};

const nva = async (id: string) => {
  const nva = await getNvaPublication({ id });
  const pub = await pubFromNva(nva);
  ndjson(pub);
};

const run = (cmd: string | undefined, params: string[]) => {
  const [id] = params;
  switch (cmd) {
    case "crossref":
      return crossref(params);

    case "nva":
      return nva(id);

    default:
      throw new RangeError(`Unknown publication source: ${cmd}`);
  }
};

if (import.meta.main) {
  const [cmd, ...params] = Deno.args;
  run(cmd, params);
}
