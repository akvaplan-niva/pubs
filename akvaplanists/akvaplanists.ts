import { fetchAndStreamJson } from "../io.ts";
import { Akvaplanist } from "./types.ts";

const base = Deno.env.has("AKVAPLANISTS")
  ? Deno.env.get("AKVAPLANISTS")
  : "https://akvaplanists.deno.dev";
export const currentAkvaplanistsKvUrl = (prefix: string) =>
  new URL(`/kv/${prefix}?format=json`, base);

export const getCurrentAkvaplanists = async () => {
  const r = await fetch(currentAkvaplanistsKvUrl("person"));
  return r && r.ok
    ? (await r.json()).map(({ value }: { value: Akvaplanist }) => value)
    : undefined;
};

export async function* currentAndPriorAvaplanists() {
  const urls = [
    currentAkvaplanistsKvUrl("person"),
    currentAkvaplanistsKvUrl("expired"),
  ];

  for await (const url of urls) {
    for await (const akvaplanist of fetchAndStreamJson<Akvaplanist>(url)) {
      yield akvaplanist;
    }
  }
}

// const names = (a: Akvaplanist) => {

//   const { given, family,spelling } = akvaplanist;
//   const fam = [family, ...?spelling.gn]
//   for const (f of fam)   …
// }
