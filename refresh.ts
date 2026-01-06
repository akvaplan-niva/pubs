#!/usr/bin/env -S deno run --env-file --allow-env --allow-read --allow-net
import { kv } from "./kv/kv.ts";
import { findIdentities, getPub, insertNvaPub } from "./pub/pub.ts";
import manualListOfNvaIds from "./data/nva_ids.json" with { type: "json" };

interface RefreshMetdata {
  when: Date;
  elapsed: number;
  count: number;
}

import { akvaplanistPubsInNva, akvaplanPubsInNva } from "./nva/akvaplan.ts";
import { pubFromNva } from "./pub/pub_from_nva.ts";
import type { Pub } from "./pub/types.ts";
import { isHandleUrl } from "./pub/handle.ts";
import { NvaPublication } from "./nva/types.ts";
import { getNvaPublication } from "./nva/api.ts";
import { isRejected } from "./pub/reject.ts";

async function* nvaIdentifiersInKvPubs() {
  for await (const { value } of kv.list<Pub>({ prefix: ["pub"] })) {
    if ("nva" in value) {
      yield value.nva;
    }
  }
}
// async function* akvaplanDoiPubsFromCristin() {
//   const cristinDoisSince2015 = await akvaplanDoisInCristinSince(2015);
//   const cristinDoisBefore2015 = new Set<string>();
//   // await akvaplanDoisInCristinSince(1970, 2015);
//   for (const doi of cristinDoisSince2015.union(cristinDoisBefore2015)) {
//     yield doi;
//   }
// }

// export const refreshCrossrefPubsFromManualList = async () => {
//   let count = 0;
//   for (
//     const doi of freshCrossrefDois.reverse()
//   ) {
//     console.warn("DEBUG", "New pub from manual list of Crossref DOIs", doi);
//     await insertDoiPub({ doi, reg: "Crossref" });
//     ++count;
//   }
//   await kv.set(["refresh", "manual"], { when: new Date(), count });
// };

// export const refreshDoiPubsFromCristin = async () => {
//   let count = 0;
//   for await (const doi of akvaplanDoiPubsFromCristin()) {
//     const { agency, status } = await getRegistrar(doi);
//     if (status) {
//       console.warn("WARN", { doi, status });
//     }
//     if (agency) {
//       ++count;
//       const existing = await getPub(doiUrlString(doi));
//       if (existing) {
//         // no-op
//         //console.warn("DEBUG", "Existing DOI from Cristin", doi, existing);
//       } else {
//         console.warn("New DOI from Cristin", doi, agency);
//         await insertDoiPub({ doi, reg: agency });
//       }
//     } else {
//       console.error({ doi });
//     }
//   }
//   await kv.set(["refresh", "cristin"], { when: new Date(), count });
// };

export const refreshNvaPubs = async () => {
  const ids = new Set(
    await Array.fromAsync(nvaIdentifiersInKvPubs()) as string[],
  );
  const nvaIdsBeforeRefresh = new Set(ids);

  const lr = await kv.get<RefreshMetdata>(["refresh", "nva"]);
  const lastRefresh = lr?.value;

  const params = lastRefresh
    ? {
      modified_since: lastRefresh?.when.toJSON().substring(0, 10),
    }
    : undefined;
  let found = 0;
  console.warn("refresNvaPubs", { params, refresh: lastRefresh });
  const t0 = performance.now();

  const insert = async (nva: NvaPublication, kind: string) => {
    ids.add(nva.identifier);

    // NVA identifier may be fresh, but the pub may exist under DOI or handle
    // Also, DOI or handle may be fresh
    const pub = await pubFromNva(nva);
    const rej = await isRejected(pub.id);
    if (rej) {
      console.warn("REJECTED", pub);
    }
    const pubInKv = await getPub(pub.id);
    const has = pubInKv && pubInKv.id === pub.id ? true : false;
    if (has === false) {
      const { id, type, title, published } = pub;
      const akvaplanists = (await findIdentities(pub?.authors))?.filter((a) =>
        a?.identity
      )?.map(({ identity }) =>
        [identity.id, identity.given, identity.family].join("|")
      ).filter((
        parts,
      ) => parts.length > 5);
      console.warn(
        "Fresh NVA",
        ++found,
        ids.size,
        kind,
        akvaplanists,
        [type, published],
        id,
        title,
        nva.identifier,
      );
      await insertNvaPub(nva);
    }
  };

  for await (const id of manualListOfNvaIds) {
    if (!ids.has(id)) {
      const nva = await getNvaPublication({ id });
      await insert(nva, "manual");
    }
  }

  for await (const nva of akvaplanistPubsInNva(params)) {
    if (!ids.has(nva.identifier)) {
      await insert(nva, "akvaplanist");
    }
  }

  for await (const nva of akvaplanPubsInNva(params)) {
    if (!ids.has(nva.identifier)) {
      await insert(nva, "akvaplan");
    }
  }

  const diff = ids.difference(nvaIdsBeforeRefresh);
  console.warn({ diff });

  const elapsed = (performance.now() - t0) / 1000;
  await kv.set(["refresh", "nva"], {
    when: new Date(),
    count: ids.size,
    elapsed,
    diff: [...diff],
  });
};

export const refresh = async () => {
  await kv.delete(["refresh", "nva"]);
  await refreshNvaPubs();
};

if (import.meta.main) {
  await refresh();
}
