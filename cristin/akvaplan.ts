#!/usr/bin/env -S deno run --allow-net

import { doiName, isDoiUrl } from "../doi/url.ts";

interface CristinResult {
  links: CristinLink[];
}
interface CristinLink {
  url_type: string;
  url: URL | string;
}

const search = async (url: URL) => {
  const r = await fetch(url);
  if (r.ok) {
    return await r.json();
  }
};

export const akvaplanDoisInCristinSince = async (
  since: number | string,
  before?: number | string,
) => {
  const url = new URL(
    `https://api.cristin.no/v2/results?institution=6064&published_since=${since}${
      before ? `&published_before=${before}` : ""
    }&per_page=1000&sort=year_published+desc`,
  );

  console.warn("DEBUG Cristin API URL", url.href);
  const records = await search(url);

  const withDoi = records.map((r: CristinResult) => {
    const { links } = r;
    const doilnk = links?.find((l) => "DOI" === l.url_type);
    if (doilnk) {
      return isDoiUrl(doilnk.url) ? doiName(doilnk.url) : null;
    }
  }).filter((doi: string) => typeof doi === "string").sort();
  return new Set<string>(withDoi);
};
