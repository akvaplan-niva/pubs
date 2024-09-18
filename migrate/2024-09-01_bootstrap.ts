#!/usr/bin/env -S deno run --env-file --allow-env --allow-read=./data --allow-net --allow-write=./data
import { doinameset, insertPubs } from "../kv/pub.ts";

import { ndjsonStream, saveResponse } from "../io.ts";
import { pubFromSlim } from "../pub/pub_from_slim.ts";

import type { SlimPublication } from "../slim/types.ts";
import { clear } from "../kv/kv.ts";
import { chunkArray } from "../util/chunk.ts";

const akvaplanDoisUrl = new URL(
  "https://dois.deno.dev/doi?limit=-1&format=ndjson",
);

/**
 * Bootstraps KV database from "slim" metadata from prior Akvaplan-niva DOI service
 */
export const bootstrap = async () => {
  await clear({ prefix: [] });
  const src = akvaplanDoisUrl;
  const dest = new URL("../data/slim.ndjson", import.meta.url);

  try {
    await Deno.stat(dest);
  } catch {
    const r = await fetch(src);
    await saveResponse(r, dest);
  }
  const r = await fetch(dest);
  if (r.ok && r.body) {
    const names = await doinameset();
    const arr = await Array.fromAsync(ndjsonStream<SlimPublication>(r.body));

    for await (const chunk of chunkArray(arr, 50)) {
      const pubs = chunk.filter((slim) => !names.has(slim.doi)).map(
        pubFromSlim,
      );
      await insertPubs(pubs);
      console.warn(`Inserted ${pubs.length} pubs`);
    }
  }
};
