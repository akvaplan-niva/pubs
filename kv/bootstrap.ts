#!/usr/bin/env -S deno run --allow-env=DENO_KV_PATH --allow-read --allow-net=dois.deno.dev,doi.org,api.crossref.org --allow-write

import { getPub, insertPub } from "./pub.ts";
import { getCrossrefWork } from "./crossref.ts";

import { isDoiName } from "../doi/url.ts";
import { ndjsonStream, saveResponse } from "../io.ts";
import { pubFromSlim } from "../pub/pub_from_slim.ts";
import { workFromApi } from "../crossref/work.ts";

import type { SlimPublication } from "../slim/types.ts";

const akvaplanDoisUrl = new URL(
  "https://dois.deno.dev/doi?limit=-1&format=ndjson",
);

/**
 * Bootstraps KV database with prefixes "pub", and "crossref",
 * with "slim" metadata from prior Akvaplan-niva DOI service
 */
export const bootstrap = async (url: URL, dest: URL) => {
  try {
    await Deno.stat(dest);
  } catch {
    const r = await fetch(url);
    await saveResponse(r, dest);
  }

  const r = await fetch(dest);
  if (r.ok && r.body) {
    for await (const slim of ndjsonStream<SlimPublication>(r.body)) {
      const pub = pubFromSlim(slim);
      const pubkv = await getPub(pub.id);
      if (!pubkv) {
        const res = await insertPub(pub);
        console.warn("insert", ["pub", pub.id], res);
      }
      const { doi, reg } = pub;
      if ("Crossref" === reg && doi && isDoiName(doi)) {
        const crkv = await getCrossrefWork(doi);
        if (!crkv) {
          const work = await workFromApi(doi);
          if (work) {
            console.warn("insert", ["crossref", doi]);
          }
        }
      }
    }
  }
};

if (import.meta.main) {
  bootstrap(akvaplanDoisUrl, new URL("../data/slim.ndjson", import.meta.url));
}
