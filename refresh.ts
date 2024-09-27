#!/usr/bin/env -S deno run --env-file --allow-env --allow-read --allow-net
import { kv } from "./kv/kv.ts";
import { insertDoiPub, insertNvaPub } from "./pub/pub.ts";
import { getRegistrar } from "./doi/url.ts";
import freshCrossrefDois from "./data/fresh_crossref.json" with {
  type: "json",
};

interface RefreshMetdata {
  when: Date;
  elapsed: number;
  count: number;
}

//import { akvaplanDoisInCristinSince } from "./cristin/akvaplan.ts";

import { akvaplanistPubsInNva, akvaplanPubsInNva } from "./nva/akvaplan.ts";

async function* freshAkvaplanDoiPubsFromManualListAndCristin() {
  for (const doi of freshCrossrefDois) {
    yield doi;
  }
  await kv.set(["refresh", "manual"], { when: new Date() });

  // const cristinDoisSince2015 = await akvaplanDoisInCristinSince(2015);
  // const cristinDoisBefore2015 = await akvaplanDoisInCristinSince(1970, 2015);
  // for (const doi of cristinDoisSince2015.union(cristinDoisBefore2015)) {
  //   yield doi;
  // }
}

export const refreshDoiPubsFromManualListAndCristin = async () => {
  await kv.delete(["refresh", "cristin"]);
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
  await kv.set(["refresh", "cristin"], { when: new Date() });
};

export const refresNvaPubs = async () => {
  const t0 = performance.now();
  const lr = await kv.get<RefreshMetdata>(["refresh", "nva"]);

  await kv.delete(["refresh", "nva"]);
  const lastRefresh = lr?.value;
  const ids = new Set<string>();

  const params = lastRefresh
    ? {
      modified_since: lastRefresh?.when.toJSON().substring(0, 11),
    }
    : undefined;

  for await (const nva of akvaplanPubsInNva(params)) {
    ids.add(nva.identifier);
    await insertNvaPub(nva);
    console.warn(ids.size, nva.identifier, "akvaplan");
  }
  for await (const nva of akvaplanistPubsInNva(params)) {
    if (!ids.has(nva.identifier)) {
      console.warn(nva.id);
      ids.add(nva.identifier);
      await insertNvaPub(nva);
      console.warn(ids.size, nva.identifier, "akvaplanist");
    }
  }

  const elapsed = (performance.now() - t0) / 1000;
  await kv.set(["refresh", "nva"], {
    when: new Date(),
    count: ids.size,
    elapsed,
  });
};

export const clearRefreshMetadata = async () => {
  const atomic = kv.atomic();
  ["nva", "manual", "cristin"].map((id) => {
    atomic.delete(["refresh", id]);
  });
  await atomic.commit();
};

export const refresh = async () => {
  await refreshDoiPubsFromManualListAndCristin();
  await refresNvaPubs();
};

if (import.meta.main) {
  await clearRefreshMetadata();
  refresh();
}
