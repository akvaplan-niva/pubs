#!/usr/bin/env -S deno run --env-file --allow-env --allow-net=api.test.nva.aws.unit.no
import { getCurrentAkvaplanists } from "../akvaplanists/akvaplanists.ts";
import { retrieve, searchUrl } from "./search.ts";

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

// const nvaUrlToRetrieveWorksOfCristinPerson = (id: number | string) =>
//   new URL(
//     `/search/resources?contributor_should=https://api.test.nva.aws.unit.no/cristin/person/${id}`,
//     "https://api.test.nva.aws.unit.no",
//   );

const nvaCristinPersonUrl = (id: number | string) =>
  `https://api.test.nva.aws.unit.no/cristin/person/${id}`;

export async function* akvaplanistPubsInNva(
  searchParams: Iterable<[string, string]> | Record<string, string> = [],
) {
  for await (
    const { id, family, given, cristin } of await getCurrentAkvaplanists()
  ) {
    const params = new URLSearchParams(searchParams);

    params.delete("institution");

    if (notAkvaplanists.has(id)) {
      params.set("contributor_not", notAkvaplanists.get(id)!);
    }

    // Use NVA/Cristin ID if possible to avoid similar-named people matching…
    if (cristin) {
      params.set("contributor_should", nvaCristinPersonUrl(cristin));
    } else {
      const name = [given, family].join(" ");
      params.set("contributor_name", name);
    }
    // console.warn("akvaplanistPubsInNva", {
    //   id,
    //   cristin,
    //   family,
    //   given,
    //   params: [...params],
    // });

    const url = searchUrl(params);

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
