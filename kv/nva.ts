import { NvaPublication } from "../nva/types.ts";
import { SlimPublication } from "../slim/types.ts";
import { kv } from "./kv.ts";

export const nvakey = (id: string) => ["nva", id];

export const deleteNva = async (id: string) => await kv.delete(nvakey(id));

export const setNva = async (nvapub: NvaPublication) => {
  if (nvapub) {
    const { identifier } = nvapub;
    if (JSON.stringify(nvapub).length < 65535) {
      await kv.set(nvakey(identifier), nvapub);
    } else {
      kv.set(["nva-error", identifier], {
        error: "Metadata size > 65535 bytes",
      });
    }
  }
};

export const setNvaMissing = async (pub: SlimPublication) => {
  await kv.set(["nva_missing", pub.id], pub);
};

export const setNvaMulti = async (id, nvas: string[]) => {
  await kv.set(["nva_multi", id], nvas);
};
