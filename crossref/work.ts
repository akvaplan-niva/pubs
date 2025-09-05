import { CrossrefWork, CrossrefWorkMessage } from "./types.ts";

const fetchWorkFromCrossrefApi = async (doi: string) =>
  await fetch(new URL(`https://api.crossref.org/works/${doi}`));

const fetchWork = async (doi: string) =>
  await fetch(new URL(`https://pubs.deno.dev/crossref/${doi}`));

const getWorkFromPubsApi = async (doi: string) => {
  const r = await fetchWork(doi);
  if (r?.ok) {
    return await r.json() as CrossrefWork;
  }
};

export const getWorkFromCrossrefApi = async (doi: string) => {
  const r = await fetchWorkFromCrossrefApi(doi);
  const text = await r.text();
  if (r?.ok) {
    const { status, message }: CrossrefWorkMessage = JSON.parse(text);
    if (r?.ok && "ok" === status) {
      return message;
    } else {
      console.error(doi, r.status, r.url, status, message);
    }
  }
};

export const getCrossrefWorkFromApi = async (
  doi: string,
): Promise<CrossrefWork | undefined> => {
  const work = await getWorkFromPubsApi(doi);
  if (work) {
    return work;
  } else {
    return getWorkFromCrossrefApi(doi);
  }
};
