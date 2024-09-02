# Akvaplan-niva pubs

Deno project operating Akvaplan-niva'a
[publication metadata service](https://pubs.deno.dev/pub), used in
https://akvaplan.no/en/pubs

The production database is persisted in Deno Deploy
[KV](https://docs.deno.com/deploy/kv/manual/#production-usage).

New publications are automatically added by polling Norway's
[National research archive](https://nva.unit.no) via the
[NVA API](https://api.nva.unit.no).

This project replaces [https://github.com/akvaplan-niva/dois](dois), using a
backwards-compatible format ("slim").

## Criteria for inclusion

Any published work where

1. At least 1 author has explicit Akvaplan-niva affiliation
2. At least 1 author is currently affiliated with Akvaplan-niva
3. The work is financed by Akvaplan-niva

Criteria 2 means that new employees will be listed with their full academic
record including works pre-dating employment.
