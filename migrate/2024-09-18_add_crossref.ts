#!/usr/bin/env -S deno run --env-file --allow-env --allow-net
import { refreshCrossref } from "../crossref/refresh_crossref.ts";

if (import.meta.main) {
  refreshCrossref();
}
