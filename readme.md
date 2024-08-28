# Akvaplan-niva pubs

Deno project operating Akvaplan-niva'a publication metadata service.

The production database is persisted in Deno Deploy
[KV](https://docs.deno.com/deploy/kv/manual/#production-usage).

New publications are automatically added by polling Norway's
[National research archive](https://nva.unit.no) via the
[NVA API](https://api.nva.unit.no).

This project replaces [https://github.com/akvaplan-niva/dois](dois), using a
backwards-compatible format ("slim").
