#!/usr/bin/env -S deno run --env-file --allow-env --allow-read --allow-net
import { kv } from "./kv/kv.ts";
import {
  doiset,
  findIdentities,
  getPub,
  handleset,
  insertDoiPub,
  insertNvaPub,
} from "./pub/pub.ts";
import { doiUrlString, getRegistrar, isDoiUrl } from "./doi/url.ts";
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
import { pubFromNva } from "./pub/pub_from_nva.ts";
import { Pub } from "./pub/types.ts";
import { isRejected } from "./pub/reject.ts";
import { isHandleUrl } from "./pub/handle.ts";

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

export const refreshCrossrefPubsFromManualList = async () => {
  let count = 0;
  for (
    const doi of freshCrossrefDois.reverse()
  ) {
    console.warn("DEBUG", "New pub from manual list of Crossref DOIs", doi);
    await insertDoiPub({ doi, reg: "Crossref" });
    ++count;
  }
  await kv.set(["refresh", "manual"], { when: new Date(), count });
};

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

export const refreshNvaFromEmployedAkvaplanists = async (
  params: Iterable<[string, string]> | Record<string, string> = [],
  ids: Set<string>,
) => {
  //const ids = new Set(await Array.fromAsync(nvaIdentifiersInKvPubs()));
  const dois = await doiset();
  const handles = await handleset();
  let count = 0;

  for await (const nva of akvaplanistPubsInNva(params)) {
    if (!ids.has(nva.identifier)) {
      ids.add(nva.identifier);

      const pub = await pubFromNva(nva);
      const { id, title, published } = pub;

      if (false === await isRejected(id)) {
        console.warn(ids.size, "akvaplanist", published, id, title);

        if (dois.has(id) || handles.has(id)) {
          // no-op: ignore if KV pub already exists under DOI or Handle
        } else if (isDoiUrl(id)) {
          //   const { agency, status } = await getRegistrar(doiName(id));
          //   if (agency) {
          //     //await insertNvaPub(nva);

          //     console.warn(id, agency, ++count);
          //   } else {
          //     console.error({ id, status });
          //   }
          // }
        }
      }
    }
  }
};
export const refreshNvaPubs = async () => {
  const ids = new Set(
    await Array.fromAsync(nvaIdentifiersInKvPubs()) as string[],
  );
  const had = new Set(ids);
  // const dois = await doiset();
  // const handles = await handleset();

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

  for await (const nva of akvaplanistPubsInNva(params)) {
    const pub = await pubFromNva(nva);
    const { id, type, title, published } = pub;

    if (!ids.has(nva.identifier)) {
      console.warn("Fresh NVA", nva.identifier);
      ids.add(nva.identifier);
      let has = false;
      if (isDoiUrl(id) || isHandleUrl(id)) {
        const pub = await getPub(id);
        has = pub && pub.id === id ? true : false;
      }
      if (has === false) {
        await insertNvaPub(nva);

        const akvaplanists = (await findIdentities(pub.authors))?.filter((a) =>
          a?.identity
        )?.map(({ identity }) =>
          [identity.id, identity.given, identity.family].join("|")
        ).filter((
          parts,
        ) => parts.length > 5);
        console.warn(
          ++found,
          ids.size,
          "akvaplanist",
          akvaplanists,
          [type, published],
          id,
          title,
        );
      } else {
        console.warn({ has, id, pub });
      }
    }
  }

  for await (const nva of akvaplanPubsInNva(params)) {
    const pub = await pubFromNva(nva);
    const { id, type, title, published } = pub;

    if (!ids.has(nva.identifier)) {
      ids.add(nva.identifier);
      let has = false;
      if (isDoiUrl(id) || isHandleUrl(id)) {
        const pub = await getPub(id);
        has = pub && pub.id === id ? true : false;
      }
      if (has === false) {
        await insertNvaPub(nva);
        console.warn(
          ++found,
          ids.size,
          "akvaplan",
          [type, published],
          id,
          title,
        );
      }
    }
  }

  const diff = had.difference(ids);
  console.warn(diff);

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
  // await refreshCrossrefPubsFromManualList();
  // Cristin is replaced by NVA
  // await refreshDoiPubsFromCristin();
  // await kv.delete(["refresh", "nva"]);
  await refreshNvaPubs();
};

Deno.cron("refresh", "9 */4 * * *", () => {
  console.warn("Refresh NVA", new Date());
  refresh();
});

if (import.meta.main) {
  await refresh();
}
