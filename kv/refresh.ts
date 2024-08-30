#!/usr/bin/env -S deno run --unstable-kv --env-file --allow-env --allow-read --allow-net=api.cristin.no,api.test.nva.aws.unit.no,doi.org,api.crossref.org,dois.deno.dev
import { doinames, insertDoiPub } from "./pub.ts";
import { getRegistrar } from "../doi/url.ts";
import freshCrossrefDois from "../data/fresh_crossref.json" with {
  type: "json",
};

import { akvaplanDoisInCristinSince } from "../cristin/akvaplan.ts";

import _ignore from "../data/ignore.json" with {
  type: "json",
};

const ignore = new Set(_ignore);

async function* freshAkvaplanDoiPubs() {
  const names = await doinames();
  for (const doi of freshCrossrefDois) {
    if (!names.has(doi) && !ignore.has(doi)) {
      names.add(doi);
      yield doi;
    }
  }

  const cristinDoisSince2015 = await akvaplanDoisInCristinSince(2015);
  const cristinDoisBefore2015 = await akvaplanDoisInCristinSince(1970, 2015);
  for (const doi of cristinDoisSince2015.union(cristinDoisBefore2015)) {
    if (!names.has(doi) && !ignore.has(doi)) {
      names.add(doi);
      yield doi;
    }
  }
}

export const refreshDoiPubs = async () => {
  for await (const doi of freshAkvaplanDoiPubs()) {
    const { agency, status } = await getRegistrar(doi);
    if (status) {
      console.error("ERR", { doi, status });
    }
    if (agency) {
      console.warn("DEBUG", "fresh", agency, "DOI:", doi);
      await insertDoiPub({ doi, reg: agency });
    }
  }
};

if (import.meta.main) {
  refreshDoiPubs();
}
