#!/usr/bin/env -S deno run --env-file --allow-env --allow-net
import { kv } from "../kv/kv.ts";
import { updatePub } from "../pub/pub.ts";
import type { Pub } from "../pub/types.ts";

export const addAkvaplanists = async () => {
  let i = 0;
  for await (const { value } of kv.list<Pub>({ prefix: ["pub"] })) {
    const { akvaplanists } = value;
    if (!akvaplanists) {
      console.warn(++i, "addAkvaplanists");
      await updatePub(value);
    }
  }
};
