# Akvaplan-niva pubs

Deno project for managing Akvaplan-niva's
[publications](https://akvaplan.no/en/pubs)

Service URL: https://pubkv.apn.deno.net/pub

## Development

```sh
deno task dev
```

## Data

The production database is persisted in Deno Deploy KV.

NVA is now the only data source and is updated via [cron.ts] in production.

Manual NVA refresh:

```sh
deno task refresh
```

## Config

Optional, see [`nva/config.ts`](nva/config.ts) for possibe `env` variables.

## Inclusion criteria

Before NVA integrayion, the following inclusion criteria were used:

Any published work where

1. At least 1 author has explicit Akvaplan-niva affiliation
2. At least 1 author is currently affiliated with Akvaplan-niva
3. The work is financed, supported, contributed to, by Akvaplan-niva*

Criteria 2 means that employees may be listed with their full academic record
including works pre/post-dating employment.

[*] Examples:

- https://doi.org/10.3897/zookeys.181.2712
- https://hdl.handle.net/11250/2449846
