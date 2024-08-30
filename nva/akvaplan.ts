#!/usr/bin/env -S deno run --unstable-kv --env-file --allow-env --allow-net=api.test.nva.aws.unit.no
import { searchParams } from "./defaults.ts";
import { retrieve, searchUrl } from "./search.ts";
import { NvaHit } from "./types.ts";

// FIXME Allow searching only for records modified since…
export async function* akvaplanPubsInNva() {
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
    if (doi && URL.canParse(doi)) {
      const { pathname } = new URL(doi.toLowerCase());
      const doiname = decodeURIComponent(pathname.replace("/", ""));
      yield [doiname, hit] as [string, NvaHit];
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
