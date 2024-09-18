#!/usr/bin/env -S deno run --env-file --allow-env --allow-net

import { currentAndPriorAvaplanists } from "./akvaplanists.ts";
import type { Akvaplanist, AkvaplanistSpelling } from "./types.ts";

const ids = new Map<string, Akvaplanist>();

const spellings = new Map<string, AkvaplanistSpelling>();

export const getSpellings = async () => {
  if (spellings.size === 0) {
    for await (const [k, v] of await initIdsAndSpellingsMap()) {
      spellings.set(k, v);
    }
  }
  return spellings;
};

export const normUpper = (name: string) =>
  name.replaceAll(".", " ").replace(/[\s]{2,}/g, " ").trim()
    .toLocaleUpperCase("no");

const initIdsAndSpellingsMap = async () => {
  const spellings = new Map<string, AkvaplanistSpelling>();
  for await (const a of currentAndPriorAvaplanists()) {
    const { id, family, given, openalex, orcid, prior } = a;
    ids.set(a.id, { id, family, given, openalex, orcid, prior });

    const spelling: AkvaplanistSpelling = {
      id: a.id,
      gn: new Set(),
      fn: new Set(),
    };
    spelling.fn.add(a.family!);
    spelling.gn.add(a.given!);

    if (a.spelling) {
      if (a.spelling.gn) {
        for (const g of a.spelling.gn) {
          spelling.gn.add(g);
        }
      }
      if (a.spelling.fn) {
        for (const f of a.spelling.fn) {
          spelling.fn.add(f);
        }
      }
    }
    spellings.set(a.id, spelling);
  }
  return spellings;
};

const detectFamilyGiven = (
  { family, given }: { family: string; given: string },
  spellings: Map<string, AkvaplanistSpelling>,
) => {
  for (const [id, { fn, gn }] of spellings) {
    if (fn.has(family) && gn.has(given)) {
      return id;
    }
  }
};

export const findId = async (
  { family, given, name }: {
    family?: string | undefined;
    given?: string | undefined;
    name?: string;
  },
  spellings?: Map<string, AkvaplanistSpelling>,
) => {
  if (!spellings) {
    spellings = await getSpellings();
  }
  if (family && given) {
    return detectFamilyGiven({ family, given }, spellings);
  }
  for (const [id, { fn, gn }] of spellings) {
    const fam = [...fn].find((f) => name?.endsWith(f));
    if (fam) {
      const giv = [...gn].find((g) => name?.startsWith(g));
      if (giv) {
        return id;
      }
    }
  }
};

export const identify = async (params: {
  family?: string | undefined;
  given?: string | undefined;
  name?: string;
}) => {
  const id = await findId(params);
  return id && ids.has(id) ? ids.get(id) : undefined;
};
