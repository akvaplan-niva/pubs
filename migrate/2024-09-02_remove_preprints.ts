#!/usr/bin/env -S deno run --env-file --allow-env --allow-net
// Closes https://github.com/akvaplan-niva/pubs/issues/4
import { doiUrlString } from "../doi/url.ts";
import { deleteMany, kv } from "../kv/kv.ts";

const delDois = [
  "10.1101/150060",
  "10.1101/2022.10.05.510968",
  "10.1101/2023.02.16.528770",
  "10.1101/2024.03.11.584451",
  "10.21203/rs.3.rs-1845231/v1",
  "10.21203/rs.3.rs-2069283/v1",
  "10.21203/rs.3.rs-2436026/v1",
  "10.21203/rs.3.rs-2657795/v1",
  "10.21203/rs.3.rs-3440779/v1",
  "10.21203/rs.3.rs-3542192/v1",
  "10.21203/rs.3.rs-3885168/v1",
  "10.22541/au.168197955.55195128/v1",
  "10.5194/bg-2017-540",
  "10.5194/bg-2021-166",
  "10.5194/bgd-9-8173-2012",
  "10.5194/egusphere-2023-214",
  "10.5194/egusphere-2023-73",
  "10.5194/essd-2020-401",
  "10.5194/essd-2021-256",
  "10.5194/essd-2022-41",
  "10.5194/gmd-2023-244",
  "10.5194/os-2021-30",
  "10.5194/os-2021-41",
  "10.5194/tc-2017-110",
  "10.5194/tcd-6-4305-2012",
  "10.7287/peerj.preprints.26650",
  "10.7287/peerj.preprints.26650v1",
];

export const removePreprints = async () => {
  const pubkeys = delDois.map((doi) => ["pub", doiUrlString(doi)]);
  await deleteMany(pubkeys);
  const crossrefkeys = delDois.map((doi) => ["crossref", doi]);
  await deleteMany(crossrefkeys);

  for (const [, id] of pubkeys) {
    const key = ["reject", id];
    await kv.set(key, "removePreprints");
  }
  removePreprints;
};

if (import.meta.main) {
  removePreprints();
}
