import { doiUrlString } from "../doi/url.ts";
import { kv } from "../kv/kv.ts";
import { Pub } from "../pub/types.ts";

export interface OpenalexWork {
  open_access: {
    oa_status: string;
    is_oa: boolean;
  };
  primary_location: {
    is_oa: boolean;
    license: string;
    pdf_url: URL | string;
  };
}

const openAlexApi = "https://api.openalex.org";

export const openalexPersonUrl = (id: string) =>
  new URL(`/people/${id}`, openAlexApi);

export const openalexWorksUrl = (id: string) =>
  new URL(`/works/${id}`, openAlexApi);
export const fetchOpenalexWork = async (id: string) =>
  await fetch(openalexWorksUrl(id));

export const fetchOpenalexPerson = async (id: string) =>
  await fetch(openalexPersonUrl(id));

const patchInOpenAccess = (pub: Pub, openalex: OpenalexWork) => {
  const { open_access } = openalex;
  const { oa_status, is_oa } = open_access;
  pub.open_access = is_oa;
  pub.open_access_status = oa_status;
  return pub;
};

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
        await kv.set(key, openalex);
        return patchInOpenAccess(pub, openalex);
      }
    }
  }
  return pub;
};
