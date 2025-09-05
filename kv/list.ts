#!/usr/bin/env -S deno run --env-file --allow-env -N
import { kv } from "./kv.ts";

export const listCommand = async (prefix) => {
  for await (
    const { key, value } of kv.list({ prefix })
  ) {
    console.log(JSON.stringify({ key, value }));
  }
};

if (import.meta.main) {
  const [_p] = Deno.args;
  const prefix = _p ? JSON.parse(_p) : ["pub"];
  listCommand(prefix);
}
