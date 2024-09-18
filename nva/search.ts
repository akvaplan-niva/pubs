import { getNvaConfigFromEnv } from "./config.ts";
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
