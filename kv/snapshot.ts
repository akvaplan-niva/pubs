#!/usr/bin/env -S deno run --env-file --allow-env --allow-net --allow-write=./data/snapshot/
import { kv } from "./kv.ts";

export const createSnapshot = async (prefix0: string) => {
  const today = new Date().toJSON().substring(0, 10);
  const dir = `./data/snapshot/${today}`;
  await Deno.mkdir(dir, { recursive: true });
  const select = { prefix: [prefix0] };
  const file = `${dir}/${select.prefix}.ndjson`;

  const f = await Deno.open(file, {
    append: true,
    write: true,
    create: true,
  });
  const stat = await f.stat();
  if (stat.isFile) {
    await f.truncate(0);
  }
  const enc = new TextEncoder();
  for await (
    const { key, value } of kv.list(select)
  ) {
    f.write(enc.encode(JSON.stringify({ key, value }) + "\n"));
  }
  f.close();
};

if (import.meta.main) {
  const prefixes = [
    "by",
    "cristin",
    "crossref",
    "nva",
    "nva-error",
    "openalex_doi",
    "pub",
    "published",
    "refresh",
    "reject",
  ];
  for (const prefix of prefixes) {
    createSnapshot(prefix);
  }
}
