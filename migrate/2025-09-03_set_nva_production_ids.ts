#!/usr/bin/env -S deno run --env-file --allow-env --allow-net
import { normUpper } from "../akvaplanists/identify.ts";
import { isDoiUrl } from "../doi/url.ts";
import { kv } from "../kv/kv.ts";
import { deleteNva, setNva, setNvaMissing } from "../kv/nva.ts";
import { searchNvaForId } from "../nva/api.ts";
import { isHandleUrl } from "../pub/handle.ts";
import { updatePub } from "../pub/pub.ts";
import { extractId, pubFromNva } from "../pub/pub_from_nva.ts";
import type { Pub } from "../pub/types.ts";

export const findNvaIdWhenDoiOrHandle = async () => {
  let i = 0;
  let c = 0;

  for await (
    const { value } of kv.list<Pub>({ prefix: ["pub"] })
  ) {
    try {
      const { id, nva, title } = value;

      if (isDoiUrl(id) || isHandleUrl(id)) {
        const res = await searchNvaForId(id);
        if (res) {
          const { totalHits, hits } = res;
          if (0 === totalHits) {
            console.error("Not in NVA", { id, title });
            const res = await setNvaMissing(value);
          } else if (1 === totalHits) {
            const [nvaPub] = hits;
            const foundId = extractId(nvaPub);
            const { identifier } = nvaPub;
            console.warn(c++, i, id, identifier, title);
            if (normUpper(id) !== normUpper(foundId)) {
              throw new Error(
                `Id mismatch: ${JSON.stringify({ id, foundId })}`,
              );
            }
            if (nva && nva !== identifier) {
              await deleteNva(nva);

              await setNva(nvaPub);
              value.nva = identifier;
              const res = await updatePub(value);
              console.warn(res);
            }
          } else {
            //console.warn(n++, { totalHits, id, type, title });
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      i++;
    }
  }
};

if (import.meta.main) {
  findNvaIdWhenDoiOrHandle();
}
