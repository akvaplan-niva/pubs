import { getPub, insertPub, savePub, upsertNvaPub } from "../pub/pub.ts";
import { pubFromNva } from "../pub/pub_from_nva.ts";

export const resourcesForProjectNvaSearchUrl = (id: number) =>
  `https://api.nva.unit.no/search/resources?aggregation=none&project=https%3A%2F%2Fapi.nva.unit.no%2Fcristin%2Fproject%2F${id}&from=0&results=100&order=modifiedDate&sort=desc`;

const nvaProjectIds = async () => {
  const akvaplanProjectsUrl =
    `https://akvaplan.no/api/kv/list/project?format=json`;
  const r = await fetch(akvaplanProjectsUrl);
  const known = new Set([
    2650646,
    2748769,
    2663184,
    2730024,
    2663173,
    2650647,
    2748518,
    2694515,
    2748528,
    2650643,
    2650640,
    2703192,
    2730024,
    2650658,
    2652065,
    2650642,
    612264,
    2650644,
    2663157,
  ]);

  const found = new Set(
    (await r.json()).map(({ value }: { value: { cristin?: number } }) =>
      value.cristin
    )
      .filter(
        (n: number) => n > 0,
      ),
  );
  console.warn("Missing NVA projects in KV", known.difference(found));
  return found.union(known);
};

// Projects are not included in organisation portfolio,
// so works with only external authors would not be included without looking in the project output
export const refreshProjects = async () => {
  let i = 0;
  const ids = await nvaProjectIds();
  ids.forEach(async (id) => {
    const url = resourcesForProjectNvaSearchUrl(id);
    console.warn(url);
    const r = await fetch(url);
    if (r.ok) {
      const { hits } = await r.json();
      for await (
        const nva of hits
      ) {
        const pub = await pubFromNva(nva);
        const pubInKv = await getPub(pub.id);
        const has = pubInKv && pubInKv.id === pub.id ? true : false;

        if (!has) {
          const ins = await upsertNvaPub(nva);
          console.warn(++i, pub, ins);
        } else {
          if (+pub.modified > +pubInKv?.modified) {
            console.warn(
              pub.id,
              "NVA updated",
              pub.modified,
              "in KV",
              pubInKv.modified,
              "diff",
              +pub.modified - +pubInKv.modified,
            );
            await savePub({ ...pubInKv, ...pub });
          }
        }
      }
    }
  });
};
