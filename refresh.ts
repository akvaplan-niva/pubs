#!/usr/bin/env -S deno run --env-file --allow-env --allow-read --allow-net
import { kv } from "./kv/kv.ts";
import { getPub, insertDoiPub, insertNvaPub } from "./pub/pub.ts";
import { doiUrlString, getRegistrar } from "./doi/url.ts";
import { akvaplanDoisInCristinSince } from "./cristin/akvaplan.ts";
import freshCrossrefDois from "./data/fresh_crossref.json" with {
  type: "json",
};

interface RefreshMetdata {
  when: Date;
  elapsed: number;
  count: number;
}

import { akvaplanistPubsInNva, akvaplanPubsInNva } from "./nva/akvaplan.ts";

async function* akvaplanDoiPubsFromCristin() {
  const cristinDoisSince2015 = await akvaplanDoisInCristinSince(2015);
  const cristinDoisBefore2015 = new Set<string>(); // await akvaplanDoisInCristinSince(1970, 2015);
  for (const doi of cristinDoisSince2015.union(cristinDoisBefore2015)) {
    yield doi;
  }
}

export const refreshCrossrefPubsFromManualList = async () => {
  let count = 0;
  for (const doi of freshCrossrefDois) {
    console.warn("DEBUG", "New pub from manual list of Crossref DOIs", doi);
    await insertDoiPub({ doi, reg: "Crossref" });
    ++count;
  }
  await kv.set(["refresh", "manual"], { when: new Date(), count });
};

export const refreshDoiPubsFromCristin = async () => {
  let count = 0;
  for await (const doi of akvaplanDoiPubsFromCristin()) {
    const { agency, status } = await getRegistrar(doi);
    if (status) {
      console.warn("WARN", { doi, status });
    }
    if (agency) {
      ++count;
      const existing = await getPub(doiUrlString(doi));
      if (existing) {
        // no-op
        //console.warn("DEBUG", "Existing DOI from Cristin", doi, existing);
      } else {
        console.warn("New DOI from Cristin", doi, agency);
        await insertDoiPub({ doi, reg: agency });
      }
    } else {
      console.error({ doi });
    }
  }
  await kv.set(["refresh", "cristin"], { when: new Date(), count });
};

export const refresNvaPubs = async () => {
  const lr = await kv.get<RefreshMetdata>(["refresh", "nva"]);
  const lastRefresh = lr?.value;
  const nvaIdentifiers = new Set<string>();
  console.warn(lastRefresh);
  // const params = lastRefresh
  //   ? {
  //     modified_since: lastRefresh?.when.toJSON().substring(0, 10),
  //   }
  //   : undefined;
  const today = new Date();
  const params = {
    modified_since: today.toJSON().substring(0, 10),
  };
  console.warn("refresNvaPubs", { params, refresh: lastRefresh });
  for await (const nva of akvaplanPubsInNva(params)) {
    nvaIdentifiers.add(nva.identifier);
    await insertNvaPub(nva);
    console.warn(nvaIdentifiers.size, nva.identifier, "akvaplan");
  }
  for await (const nva of akvaplanistPubsInNva(params)) {
    if (!nvaIdentifiers.has(nva.identifier)) {
      nvaIdentifiers.add(nva.identifier);
      await insertNvaPub(nva);
      console.warn(nvaIdentifiers.size, nva.identifier, "akvaplanist");
    }
  }

  // const elapsed = (performance.now() - t0) / 1000;
  // await kv.set(["refresh", "nva"], {
  //   when: new Date(),
  //   count: nvaIdentifiers.size,
  //   elapsed,
  // });
};

export const clearRefreshMetadata = async () => {
  const atomic = kv.atomic();
  ["nva", "manual", "cristin"].map((id) => {
    atomic.delete(["refresh", id]);
  });
  await atomic.commit();
};

export const refresh = async () => {
  //await refreshCrossrefPubsFromManualList();
  // Enable Cristin until NVA is launched
  // await refreshDoiPubsFromCristin();
  // Disable NVA until launch
  await refresNvaPubs();
};

if (import.meta.main) {
  await clearRefreshMetadata();
  refresh();
}
