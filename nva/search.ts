import { getNvaConfigFromEnv } from "./config.ts";

const { base } = getNvaConfigFromEnv();
// const isDoiName
const isDoi = (id: URL | string) =>
  URL.canParse(id) && "doi.org" === new URL(id).hostname;
const isHandle = (id: string) => "hdl.handle.net" === new URL(id).hostname;
const isDoiOrHandle = (id: string) => isDoi(id) || isHandle(id);

import type {
  NvaHitsGenerator,
  NvaPublication,
  NvaSearchResults,
} from "./types.ts";

export const searchUrl = (params: Iterable<string[]> = []) => {
  const { base } = getNvaConfigFromEnv();
  const url = new URL("/search/resources", base);
  for (const [k, v] of params) {
    url.searchParams.set(k, v);
  }
  return url;
};

const _search = async (url: URL) => {
  const r = await fetch(url);
  if (r.ok) {
    return await r.json() as NvaSearchResults;
  }
};

export const search = async (params: Iterable<string[]>) => {
  const url = searchUrl(params);
  return await _search(url);
};

export const searchNvaForId = async (id: string) => {
  const url = new URL(`/search/resources`, base);
  if (isHandle(id)) {
    url.searchParams.set("handle", id);
  } else if (isDoi(id)) {
    url.searchParams.set("doi", id);
  } else {
    throw new RangeError();
  }

  const r = await fetch(url);
  if (r?.ok) {
    return r.json();
  }
};

export async function* retrieveInBatches(
  url: URL,
  retrieved = 0,
): AsyncGenerator<NvaHitsGenerator> {
  const res = await _search(url);
  if (res) {
    const { hits, nextResults, totalHits } = res;
    retrieved += res.hits?.length;

    yield hits;

    if (nextResults) {
      yield* retrieveInBatches(new URL(nextResults), retrieved);
    } else {
      console.assert(
        retrieved === totalHits,
        `Retrieved hits (${retrieved}) !== totalHits (${totalHits})`,
      );
    }
  }
}

export async function* retrieve(
  url: URL,
): AsyncGenerator<NvaPublication> {
  for await (const batch of retrieveInBatches(url)) {
    for (const hit of batch) {
      yield hit;
    }
  }
}
