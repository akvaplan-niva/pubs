#!/usr/bin/env -S deno run --env-file --allow-env=DENO_KV_PATH,DENO_KV_ACCESS_TOKEN --allow-read=./data --allow-net=dois.deno.dev,doi.org,api.crossref.org,api.deno.com,us-east4.txnproxy.deno-gcp.net --allow-write=./data
import { doinames, insertPub, setPub } from "./pub.ts";
import { getCrossrefWork, setCrossrefWork } from "./crossref.ts";

import { isDoiName } from "../doi/url.ts";
import { ndjsonStream, saveResponse } from "../io.ts";
import { pubFromSlim } from "../pub/pub_from_slim.ts";
import { workFromApi } from "../crossref/work.ts";

import type { SlimPublication } from "../slim/types.ts";
import { pubFromCrossrefWork } from "../pub/pub_from_crossref.ts";
import { CrossrefWork } from "../crossref/types.ts";

const akvaplanDoisUrl = new URL(
  "https://dois.deno.dev/doi?limit=-1&format=ndjson",
);

/**
 * Bootstraps KV database from "slim" metadata from prior Akvaplan-niva DOI service
 */
export const bootstrap = async (url: URL, dest: URL) => {
  try {
    await Deno.stat(dest);
  } catch {
    const r = await fetch(url);
    await saveResponse(r, dest);
  }
  const names = await doinames();
  const r = await fetch(dest);
  if (r.ok && r.body) {
    for await (const slim of ndjsonStream<SlimPublication>(r.body)) {
      const pub = pubFromSlim(slim);

      const { doi, reg } = pub;
      let work = {};

      if (doi && "Crossref" === reg && isDoiName(doi)) {
        const crkv = await getCrossrefWork(doi);
        if (crkv) {
          work = crkv;
        } else {
          const crapi = await workFromApi(doi);
          if (crapi) {
            work = crapi;
            const res = await setCrossrefWork(work as CrossrefWork);
            console.warn("INFO insert", ["crossref", doi], res);
          } else {
            console.error("ERR missing Crossref metadata", doi);
          }
        }
      }
      if (true || doi && !names.has(doi)) {
        const pubcr = work ? pubFromCrossrefWork(work as CrossrefWork) : null;
        if (pubcr) {
          pub.created = pubcr.created;
          pub.modified = pubcr.modified;
        }
        const res = await setPub(pub);
        console.warn("insert", ["pub", pub.id], res);
      }
    }
  }
};

if (import.meta.main) {
  bootstrap(akvaplanDoisUrl, new URL("../data/slim.ndjson", import.meta.url));
}
