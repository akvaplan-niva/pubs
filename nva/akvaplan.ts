#!/usr/bin/env -S deno run --env-file --allow-env --allow-net=api.test.nva.aws.unit.no
import { doiname, isDoiUrl } from "../doi/url.ts";
//import { searchParams } from "./defaults.ts";
import { retrieve, searchUrl } from "./search.ts";
import type { NvaPublication } from "./types.ts";
import { pubFromNva } from "../pub/pub_from_nva.ts";

// FIXME akvaplanPubsInNva: Allow searching only for records modified since…
// FIXME akvaplanPubsInNva: Search also by names, since authors may have work only connected to other institutions while working at Akvaplan,
// or works that explicitly linked with Akvaplan-niva in the original, but are lacking affiliation in the NVA metadata

export async function* akvaplanPubsInNva(
  searchParams: Iterable<[string, string]> | Record<string, string> = [],
) {
  const params = new URLSearchParams(searchParams);
  params.set("institution", "AKVAPLAN");
  const url = searchUrl(params);
  for await (const hit of retrieve(url)) {
    yield hit;
  }
}

export async function* akvaplanDoiPubsInNva(
  searchParams: Iterable<[string, string]> | Record<string, string> = [],
) {
  for await (const hit of akvaplanPubsInNva(searchParams)) {
    const { reference } = hit.entityDescription;
    const { doi } = reference;
    if (doi && isDoiUrl(doi)) {
      const name = doiname(doi);
      yield [name, hit] as [string, NvaPublication];
    }
  }
}

export async function* akvaplanNonDoiPubsInNva(
  searchParams: Iterable<[string, string]> | Record<string, string> = [],
) {
  for await (const hit of akvaplanPubsInNva(searchParams)) {
    const { reference } = hit.entityDescription;
    const { doi } = reference;
    if (!doi) {
      yield hit;
    }
  }
}

if (import.meta.main) {
  for await (const nva of akvaplanNonDoiPubsInNva()) {
    const pub = await pubFromNva(nva);
    console.log(JSON.stringify(pub));
  }
}
