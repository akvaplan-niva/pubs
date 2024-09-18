#!/usr/bin/env -S deno run --env-file --allow-env --allow-net
import { downloadPublicFile } from "./api.ts";

if (import.meta.main) {
  const [id, file] = Deno.args;
  if (id && file) {
    await downloadPublicFile({ id, file });
  }
}
