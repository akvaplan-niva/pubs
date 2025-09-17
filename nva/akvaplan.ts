#!/usr/bin/env -S deno run --env-file --allow-env --allow-net=api.test.nva.aws.unit.no
import { getCurrentAkvaplanists } from "../akvaplanists/akvaplanists.ts";
import { kv } from "../kv/kv.ts";
import { pubFromNva } from "../pub/pub_from_nva.ts";
import { ignoreTypes } from "./config.ts";
import { nvaCristinPersonUrl } from "./cristin_person.ts";
import { retrieve, searchUrl } from "./search.ts";

// Search also by names, since authors may have work only connected to other institutions while working at Akvaplan,
// or works that explicitly linked with Akvaplan-niva in the original, but are lacking affiliation in the NVA metadata
// https://swagger-ui.test.nva.aws.unit.no/#/NVA%20Public%20Search%20API/searchResources
// fields
// string
// (query)
// export async function contributedPubsInNva(
//   akvaplanist: Akvaplanist,
//   searchParams: Iterable<[string, string]> | Record<string, string> = [],
// ) {

//   const { given, family } = akvaplanist;
//   const fam = [family, ...akvaplanist?.gn]
//   for const (f of fam)
//     // const name = `${given} ${family}`;

//     // const params = new URLSearchParams(searchParams);
//     // params.set("field", "contributor");
//     // params.set("contributor_name_should", names.join(","));
//     // const url = searchUrl(params);
//     // console.warn(url.href);
//     // for await (const hit of retrieve(url)) {
//     //   ids.add(hit.id);
//     //   yield hit;
//     // }
//   }
// }

const notAkvaplanists = new Map([
  ["aei", "https://api.nva.unit.no/cristin/person/1093971"], // aei "Anders Eilertsen",
]);

// const nvaUrlToRetrieveWorksOfCristinPerson = (id: number | string) =>
//   new URL(
//     `/search/resources?contributor_should=https://api.test.nva.aws.unit.no/cristin/person/${id}`,
//     "https://api.test.nva.aws.unit.no",
//   );

export async function* akvaplanistPubsInNva(
  searchParams: Iterable<[string, string]> | Record<string, string> = [],
) {
  for await (
    const { id, family, given, cristin } of await getCurrentAkvaplanists()
  ) {
    const params = new URLSearchParams(searchParams);

    params.delete("institution");
    params.set("size", "100");

    if (notAkvaplanists.has(id)) {
      params.set("contributor_not", notAkvaplanists.get(id)!);
    }

    // Use NVA/Cristin ID if possible to avoid similar-named people matching…
    if (cristin) {
      params.set("contributor_should", nvaCristinPersonUrl(cristin).href);
    } else {
      const name = [given, family].join(" ");
      params.set("contributor_name", name);
      params.set("institution_should", "akvaplan");
    }

    const url = searchUrl(params);
    // const pubsInKv = await Array.fromAsync(kv.list({ prefix: ["by", id] }));
    // const count = { kv: pubsInKv.length };
    console.warn({
      id,
      family,
      given,
      cristin,
      url: url.href,
    });
    for await (const hit of retrieve(url)) {
      const pub = await pubFromNva(hit);
      if (!cristin) {
        // If this code is reached, the cristin id should be found/created and added external project [akvaplanists] in external ids
        // List people without ids:
        // ~/akvaplan-niva/akvaplanists$ deno task list | nd-map d.value | nd-filter 'd.id.length===3 && !d.expired && !d.cristin' | nd-map --select id,family,cristin,from

        console.warn("akvaplanistPubsInNva [NO Cristin ID]", {
          id,
          family,
          given,
          params: [...params],
          pub,
        });
      }
      if (ignoreTypes.includes(pub.type)) {
        console.debug("ignoring", pub.type, pub.id);
      } else {
        yield hit;
      }
    }
  }
}

export async function* akvaplanPubsInNva(
  searchParams: Iterable<[string, string]> | Record<string, string> = [],
) {
  const params = new URLSearchParams(searchParams);
  //params.set("institution", "AKVAPLAN");
  params.set("searchAll", "akvaplan");
  params.set("size", "100");
  const url = searchUrl(params);
  console.warn(url.href);
  for await (const hit of retrieve(url)) {
    const pub = await pubFromNva(hit);
    if (ignoreTypes.includes(pub.type)) {
      //console.debug("ignoring", pub.type, pub.id);
    } else {
      yield hit;
    }
  }
}

// export async function* akvaplanDoiPubsInNva(
//   searchParams: Iterable<[string, string]> | Record<string, string> = [],
// ) {
//   for await (const hit of akvaplanPubsInNva(searchParams)) {
//     const { reference } = hit.entityDescription;
//     const { doi } = reference;
//     if (doi && isDoiUrl(doi)) {
//       yield [doi, hit] as [string, NvaPublication];
//     }
//   }
// }
