# Akvaplan-niva pubs

Deno project for managing Akvaplan-niva's publications

## Data service

The [data service](https://pubs.deno.dev/pub) is used as backend for
https://akvaplan.no/en/pubs

### Publications

List publications: `/pub`: https://pubs.deno.dev/pub (use `?limit=-1` to list
all)

Get metadata: `/pub/:id`

Examples:

- doi: https://pubs.deno.dev/pub/https://doi.org/10.1088/1748-9326/9/11/114021
- handle: https://pubs.deno.dev/pub/https://hdl.handle.net/10037/28898
- nva:
  `/pub/https://api.test.nva.aws.unit.no/publication/01907a69a2c5-c2cdce45-0c25-4b84-8913-c2ad1a8354c6`

### Akvaplanists

Get works by Akvaplanist: `/by/:id`: https://pubs.deno.dev/by/aki?limit=-1

See: [akvaplanists/readme.md] for details on name spelling detection.

## Data

### Persistence

The production database is persisted in Deno Deploy's
[KV](https://docs.deno.com/deploy/kv/manual/)

### Bootstrap

`./kv/bootstrap.ts`

### Data refresh

`deno task refresh`

New publications are automatically added by polling Norway's
[National research archive](https://nva.unit.no) via the
[NVA API](https://api.nva.unit.no): see `kv/refresh.ts`

This project replaces [https://github.com/akvaplan-niva/dois](dois), using a
backwards-compatible format ("slim").

### Inclusion criteria

Any published work where

1. At least 1 author has explicit Akvaplan-niva affiliation
2. At least 1 author is currently affiliated with Akvaplan-niva
3. The work is financed, supported, contributed to, by Akvaplan-niva*

Criteria 2 means that employees may be listed with their full academic record
including works pre/post-dating employment.

[*] Examples:

- https://doi.org/10.3897/zookeys.181.2712
- https://hdl.handle.net/11250/2449846

## Compare local and production

```sh
$ cat <(./kv/_list.ts pub | nd-map d.key[1] | nd-map '{id:d}') <(curl -s https://pubs.deno.dev/pub?limit=-1 | nd-map --select id,title) | nd-group d.id | nd-filter 'd[1].length !== 2'
["https://doi.org/10.1139/cjfas-56-8-1370",[{"id":"https://doi.org/10.1139/cjfas-56-8-1370"}]]
["https://doi.org/10.1016/j.chemgeo.2018.05.040",[{"id":"https://doi.org/10.1016/j.chemgeo.2018.05.040","title":"The GEOTRACES Intermediate Data Product 2017"}]]
["https://doi.org/10.1139/f99-075",[{"id":"https://doi.org/10.1139/f99-075","title":"Effect of temperature on the P4501A response in winter- and summer-acclimated Arctic char (<i>Salvelinus alpinus</i>) after oral benzo[a]pyrene exposure"}]]
```
