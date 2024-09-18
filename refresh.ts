#!/usr/bin/env -S deno run --env-file --allow-env --allow-read --allow-net
import { doinameset, idset, insertDoiPub, insertNvaPub } from "./kv/pub.ts";
import { getRegistrar } from "./doi/url.ts";
import freshCrossrefDois from "./data/fresh_crossref.json" with {
  type: "json",
};

import { akvaplanDoisInCristinSince } from "./cristin/akvaplan.ts";

import {
  akvaplanDoiPubsInNva,
  akvaplanNonDoiPubsInNva,
} from "./nva/akvaplan.ts";

const names = await doinameset();
const ids = await idset();

async function* freshAkvaplanDoiPubsFromManualListAndCristin() {
  for (const doi of freshCrossrefDois) {
    if (!names.has(doi)) {
      names.add(doi);
    }
    yield doi;
  }

  const cristinDoisSince2015 = await akvaplanDoisInCristinSince(2015);
  const cristinDoisBefore2015 = await akvaplanDoisInCristinSince(1970, 2015);
  for (const doi of cristinDoisSince2015.union(cristinDoisBefore2015)) {
    if (!names.has(doi)) {
      names.add(doi);
      yield doi;
    }
  }
}

export const refresNvaPubs = async () => {
  // 1. DOI pubs from NVA
  // Here NVA metadata is ignored and the pub is injected from original Crossref metadata
  for await (const [doi, nvapub] of akvaplanDoiPubsInNva()) {
    try {
      if (!ids.has(nvapub.id)) {
        console.warn("DEBUG NVA DOI", doi);
        insertDoiPub({ doi, reg: "Crossref" });
      }
    } catch (e) {
      console.error("Error insering DOI", doi, "from NVA", nvapub.id, e);
    }
  }
  // 2. Other, non-DOI pubs
  for await (const nvapub of akvaplanNonDoiPubsInNva()) {
    if (!ids.has(nvapub.id)) {
      await insertNvaPub(nvapub);
    }
  }
};

export const refreshDoiPubs = async () => {
  for await (const doi of freshAkvaplanDoiPubsFromManualListAndCristin()) {
    const { agency, status } = await getRegistrar(doi);
    if (status) {
      console.warn("WARN", { doi, status });
    }
    if (agency) {
      console.warn("DEBUG", "DOI from Cristin/manual", agency, "DOI:", doi);
      await insertDoiPub({ doi, reg: agency });
    } else {
      console.error({ doi });
    }
  }
};

export const refresh = () => {
  refreshDoiPubs();
  refresNvaPubs();
};

if (import.meta.main) {
  refresh();
}
