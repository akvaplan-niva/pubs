#!/usr/bin/env -S deno run --unstable-kv --env-file --allow-env --allow-read --allow-net=api.test.nva.aws.unit.no,doi.org,api.crossref.org,dois.deno.dev

import { getPub, insertDoiPub } from "./pub.ts";
import { decodedDoiUrlString, getRegistrar } from "../doi/url.ts";
import { akvaplanDoiPubsInNva } from "../nva/akvaplan.ts";
import freshCrossrefDois from "../data/fresh_crossref.json" with {
  type: "json",
};
import _ignore from "../data/ignore.json" with {
  type: "json",
};

const ignore = new Set(_ignore);
async function* freshAkvaplanDoiPubs() {
  for (const doi of freshCrossrefDois) {
    const pub = await getPub(decodedDoiUrlString(doi));
    if (!pub) {
      yield doi;
    }
  }
  for await (const [doi] of akvaplanDoiPubsInNva()) {
    const pub = await getPub(decodedDoiUrlString(doi));
    if (!pub) {
      yield doi;
    }
  }
}

if (import.meta.main) {
  for await (const doi of freshAkvaplanDoiPubs()) {
    if (!ignore.has(doi)) {
      const { agency, status } = await getRegistrar(doi);
      if (status) {
        console.warn("WARN", { doi, status });
      }
      if (agency) {
        console.warn("DEBUG", "fresh", agency, "DOI:", doi);
        await insertDoiPub({ doi, reg: agency });
      }
    }
  }
}
