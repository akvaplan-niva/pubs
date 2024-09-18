#!/usr/bin/env -S deno run --env-file --allow-env --allow-net
import { getCrossrefWorkFromApi } from "../crossref/work.ts";
import { getCrossrefWork, insertCrossrefWork } from "../kv/crossref.ts";
import { kv } from "../kv/kv.ts";
import type { Pub } from "../pub/types.ts";

export const addCrossref = async () => {
  for await (const { value } of kv.list<Pub>({ prefix: ["pub"] })) {
    const { doi, reg } = value;
    if (doi && reg === "Crossref") {
      const work = await getCrossrefWork(doi);
      if (!work) {
        const xr = await getCrossrefWorkFromApi(doi);
        if (xr) {
          insertCrossrefWork(xr);
        } else {
          console.error("Missing in Crossref", doi);
        }
      }
    }
  }
};

if (import.meta.main) {
  addCrossref();
}
