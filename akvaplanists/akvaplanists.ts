import { fetchAndStreamJson } from "../io.ts";
import { Akvaplanist } from "./types.ts";
export const currentAkvaplanistsKvUrl = (prefix: string) =>
  new URL(`https://akvaplanists.deno.dev/kv/${prefix}?format=json`);

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
