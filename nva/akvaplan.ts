#!/usr/bin/env -S deno run --unstable-kv --env-file --allow-env --allow-net=api.test.nva.aws.unit.no
import { doiname, isDoiUrl } from "../doi/url.ts";
import { searchParams } from "./defaults.ts";
import { retrieve, searchUrl } from "./search.ts";
import type { NvaHit } from "./types.ts";

// FIXME Allow searching only for records modified since…
export async function* akvaplanPubsInNva(
  searchParams: Iterable<[string, string]> | Record<string, string>,
) {
  const params = new URLSearchParams(searchParams);
  params.set("institution", "AKVAPLAN");
  const url = searchUrl(params);
  for await (const hit of retrieve(url)) {
    yield hit;
  }
}

export async function* akvaplanDoiPubsInNva() {
  for await (const hit of akvaplanPubsInNva()) {
    const { reference } = hit.entityDescription;
    const { doi } = reference;
    if (doi && isDoiUrl(doi)) {
      const name = doiname(doi);
      yield [name, hit] as [string, NvaHit];
    }
  }
}

export async function* akvaplanNonDoiPubsInNva() {
  for await (const hit of akvaplanPubsInNva()) {
    const { reference } = hit.entityDescription;
    const { doi } = reference;
    if (!doi) {
      yield hit;
    }
  }
}
