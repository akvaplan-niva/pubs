import { doiUrlString } from "../doi/url.ts";
import { kv } from "../kv/kv.ts";
import { Pub } from "../pub/types.ts";
import type { Results, Work } from "./types.ts";

const openAlexApi = "https://api.openalex.org";

export const openalexPersonUrl = (id: string) =>
  new URL(`/people/${id}`, openAlexApi);

export const openalexWorksUrl = (id: string) =>
  new URL(`/works/${id}`, openAlexApi);
export const fetchOpenalexWork = async (id: string) =>
  await fetch(openalexWorksUrl(id));

export const fetchOpenalexPerson = async (id: string) =>
  await fetch(openalexPersonUrl(id));

const patchInOpenAccess = (pub: Pub, openalex: Work) => {
  const { open_access } = openalex;
  const { oa_status, is_oa } = open_access;
  pub.open_access = is_oa;
  pub.open_access_status = oa_status;
  return pub;
};

const defaultOpenAlexSearchParams = new URLSearchParams(
  {
    page: "1",
    sort: "publication_year:desc",
    mailto: "info@akvaplan.niva.no",
    per_page: "200",
    include_xpac: "true",
  } as const,
);

const akvaplanFilter = [
  "authorships.institutions.lineage",
  "i4210138062",
] as const;

export const openAlexSearchUrl = (
  filters = new Map<string, string>(),
  params = defaultOpenAlexSearchParams,
) => {
  const filter = [...filters].map(
    ([k, v]) => `${k}:${v}`,
  ).join(",");
  params.set("filter", filter);
  const url = new URL("https://api.openalex.org/works");

  for (const [k, v] of params) {
    url.searchParams.set(k, v);
  }
  return url;
};

async function* worksPerYear({
  page = 1,
  year,
  filters,
}: {
  page?: number;
  year: number;
  filters: Map<string, string>;
}): AsyncGenerator<Work> {
  const url = openAlexSearchUrl(
    new Map([...filters, ["publication_year", String(year)]]),
  );
  url.searchParams.set("page", String(page));

  const response = await fetch(url.href);
  if (!response.ok) {
    console.error(`HTTP error ${response.status} for ${response.url}`);
    return;
  }

  const { meta, results } = (await response.json()) as Results;
  const { count, per_page } = meta;

  console.warn({ year, page, count, works: results.length });

  yield* results;

  if (count > page * per_page) {
    yield* worksPerYear({ page: page + 1, year, filters });
  }
}

function* yearsDescending(newest: number, oldest: number): Generator<number> {
  for (let y = newest; y >= oldest; y--) yield y;
}

export async function* openalexAkvaplanWorks() {
  const filters = new Map([akvaplanFilter]);
  for await (const year of yearsDescending(new Date().getUTCFullYear(), 1970)) {
    yield* worksPerYear({ year, filters });
  }
}

export const patchInOpenAccessMetadataToPub = async (pub: Pub) => {
  const { doi, open_access_status } = pub;

  if (doi && !open_access_status) {
    const id = doiUrlString(doi);
    const key = ["openalex_doi", id];
    const { value } = await kv.get<OpenalexWork>(key);

    if (value) {
      return patchInOpenAccess(pub, value);
    } else {
      const r = await fetchOpenalexWork(id);
      if (r?.ok) {
        const openalex = await r.json();
        if (JSON.stringify(openalex).length < 65000) {
          await kv.set(key, openalex);
        }
        return patchInOpenAccess(pub, openalex);
      }
    }
  }
  return pub;
};
