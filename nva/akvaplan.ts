#!/usr/bin/env -S deno run --env-file --allow-env --allow-net=api.test.nva.aws.unit.no
import { getCurrentAkvaplanists } from "../akvaplanists/akvaplanists.ts";
import { Akvaplanist } from "../akvaplanists/types.ts";
import { isDoiUrl } from "../doi/url.ts";
import { pubFromNva } from "../pub/pub_from_nva.ts";
import { PubContributor } from "../pub/types.ts";
import { retrieve, searchUrl } from "./search.ts";
import type { NvaPublication } from "./types.ts";

// FIXME akvaplanPubsInNva: Search also by names, since authors may have work only connected to other institutions while working at Akvaplan,
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
  ["aei", "https://api.test.nva.aws.unit.no/cristin/person/1093971"], // aei "Anders Eilertsen",
]);

export async function* akvaplanistPubsInNva(
  searchParams: Iterable<[string, string]> | Record<string, string> = [],
) {
  const params = new URLSearchParams(searchParams);
  const url = searchUrl(params);
  console.warn(url.href);

  for await (
    const { id, family, given, spelling, ...more }
      of await getCurrentAkvaplanists()
  ) {
    const name = [given, family].join(" ");
    params.delete("institution");
    // FIXME Use NVA/Cristin ID if possible to avoid similar-named people matching…
    //
    params.set("contributor_name", name);
    params.set("contributor_not", notAkvaplanists.get("aei")!);

    const url = searchUrl(params);
    console.warn(url.href);
    for await (const hit of retrieve(url)) {
      yield hit;
    }
  }
}

export async function* akvaplanPubsInNva(
  searchParams: Iterable<[string, string]> | Record<string, string> = [],
) {
  const params = new URLSearchParams(searchParams);
  params.set("institution", "AKVAPLAN");
  const url = searchUrl(params);
  console.warn(url.href);
  for await (const hit of retrieve(url)) {
    yield hit;
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
