import { fetchAndStreamJson } from "../io.ts";
import { kv } from "../kv/kv.ts";
import { Akvaplanist } from "./types.ts";

const base = Deno.env.has("AKVAPLANISTS")
  ? Deno.env.get("AKVAPLANISTS")
  : "https://akvaplanists.deno.dev";
export const akvaplanistsServiceUrl = (prefix: string = "") =>
  new URL(`/${prefix}?format=json`, base);

export const getCurrentAkvaplanists = async () => {
  const r = await fetch(akvaplanistsServiceUrl());
  return r && r.ok
    ? (await r.json()).map(({ value }: { value: Akvaplanist }) => value)
    : undefined;
};

export async function* currentAndPriorAvaplanists() {
  const urls = [
    akvaplanistsServiceUrl("all"),
    //currentAkvaplanistsKvUrl("expired"),
  ];

  for await (const url of urls) {
    for await (const akvaplanist of fetchAndStreamJson<Akvaplanist>(url)) {
      yield akvaplanist;
    }
  }
}

const nameString = ({ family, given }: Pick<Akvaplanist, "family" | "given">) =>
  [given, family].join(" ");

export const createNameMap = async () => {
  const nameLookup = new Map();
  for await (const akva of currentAndPriorAvaplanists()) {
    const name = nameString(akva);
    const { given, family } = akva;
    nameLookup.set(name, { given, family });
  }
  for await (
    const { value } of kv.list<Pick<Akvaplanist, "family" | "given">>({
      prefix: ["cristin", "person"],
    })
  ) {
    const name = nameString(value);
    if (!nameLookup.has(name)) {
      const { given, family } = value;
      nameLookup.set(name, { given, family });
    }
  }
  return nameLookup;
};
