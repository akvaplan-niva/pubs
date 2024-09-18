#!/usr/bin/env -S deno run --env-file --allow-env --allow-read=./data --allow-net --allow-write=./data
import { refresh } from "../refresh.ts";
import { bootstrap } from "./2024-09-01_bootstrap.ts";
import { removePreprints } from "./2024-09-02_remove_preprints.ts";
import { fixEscapes } from "./2024-09-03_fix_escapes.ts";
import { replaceAuthors } from "./2024-09-03_replace_authors.ts";
import { removeUnwarranted } from "./2024-09-10_remove.ts";
import { addCrossref } from "./2024-09-18_add_crossref.ts";

await bootstrap();
await removePreprints();
await fixEscapes();
await replaceAuthors();
await removeUnwarranted();
await addCrossref();
await refresh();
