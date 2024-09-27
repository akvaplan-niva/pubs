#!/usr/bin/env -S deno run --env-file --allow-env --allow-read=./data --allow-net --allow-write=./data

import { refresh } from "../refresh.ts";

// The following migrations are safe to run multiple times
import { removePreprints } from "./2024-09-02_remove_preprints.ts";
import { fixEscapes } from "./2024-09-03_fix_escapes.ts";
import { replaceAuthors } from "./2024-09-03_replace_authors.ts";
import { removeUnwarranted } from "./2024-09-10_remove.ts";
import { removeMultiplicates } from "./2024-09-10_remove_multiplicates.ts";
import { addAkvaplanists } from "./2024-09-18_add_akvaplaniststs.ts";
import { addCrossref } from "./2024-09-18_add_crossref.ts";

// Uncomment to bootstrap KV
// import { bootstrap } from "./2024-09-01_bootstrap.ts";
// await deleteList({ prefix: [] });
// await bootstrap();

await removePreprints();
await fixEscapes();
await replaceAuthors();
await removeUnwarranted();
await removeMultiplicates();
await addAkvaplanists();
await addCrossref();
await refresh();
