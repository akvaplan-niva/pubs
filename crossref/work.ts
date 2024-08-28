import { CrossrefWorkMessage } from "./types.ts";

const fetchWork = async (doi: string) =>
  await fetch(new URL(`https://api.crossref.org/works/${doi}`));
export const workFromApi = async (doi: string) => {
  const r = await fetchWork(doi);
  const text = await r.text();
  if (r.ok) {
    const { status, message }: CrossrefWorkMessage = JSON.parse(text);
    if ("ok" === status) {
      return message;
    }
  }
  console.error(r);
  console.error(text);
};
