#!/usr/bin/env -S deno run --env-file --allow-env --allow-net
import { doiUrlString } from "../doi/url.ts";
import { deleteMany, kv } from "../kv/kv.ts";

// Many of these are mis-attributed Akvaplan-niva by OpenAlex, when containing only NIVAists, like: https://doi.org/10.1016/j.ecoenv.2021.112585
export const delDois = [
  "10.1023/a:1008033201227", // Fixe https://github.com/akvaplan-niva/dois/issues/18#issuecomment-2059476662
  "10.5194/hess-12-491-2008", // Closes https://github.com/akvaplan-niva/dois/issues/25
  "10.2172/757029", // Who are these? Layton, D W; Edson, R; Varela, M; Napier, B
  //10.2172/15005963 M Carrol, but the right one?
  "10.1016/j.scitotenv.2009.08.029", // NIVA folks
  "10.1038/s41598-021-88835-y", // Author "J -B Hansen", seems top be confused with "Jesper Hansen" of Akvaplan-niva see https://app.cristin.no/results/show.jsf?id=1918449 and https://test.nva.sikt.no/registration/01907aa5108b-803f027c-6b26-45ec-b1da-8cd99d5c50fe
  "10.1177/0307174x0803500413", // ["Dement'ev","Makhotin","Mokhnatkina","Vol'fson"]}
  "10.1177/0307174x0903601106", // ["Il'yasov","Mokhnatkina","Potapov","Sakharova","Pyzhonkova"]}
  "10.1177/0307174x1003700309", // ["Minigaliev","Dorozhkin","Sukhova","Il'yasov","Mokhnatkina"]}
  "10.1177/0307174x1504200507", // ["Dorozhkin","Mokhnatkin","Zotov","Mokhnatkina"]}
  "10.1177/0307174x1504200508", // ["Dorozhkin","Mokhnatkin","Zotov","Mokhnatkina"]}
  "10.1177/0307174x1504200509", // ["Dorozhkin","Mokhnatkin","Zotov","Mokhnatkina"]}
  "10.1177/0307174x1504200510", // ["Zotov","Mokhnatkin","Dorozhkin","Mokhnatkina","Zaripov"]}
  "10.1177/0307174x1504200511", // ["Mokhnatkin","Zotov","Dorozhkin","Mokhnatkina"]}
  "10.1016/j.jembe.2020.151356", // NIVA
  "10.1093/plankt/fbm003", //[{"family":"Sornes","given":"T. A."},{"family":"Aksnes","given":"D. L."},{"family":"Bamstedt","given":"U."},{"family":"Youngbluth","given":"M. J."}]}
  "10.1007/s12686-012-9824-1",
  "10.1016/0141-1136(95)00034-8", // K. Hylland, et al. 2000
  "10.1016/0160-4120(96)00045-1", // Hessen & Lydersen 1996 (NIVA)
  "10.1007/s11356-022-19001-8", // NIVA
  "10.5194/egusphere-egu22-12783", // NIVA
  "10.1016/j.ecoenv.2021.112585", // NIVA
  "10.1016/j.scitotenv.2021.147455", // NIVA
  "10.1016/j.ecoena.2020.100018", // NIVA
  "10.1016/j.jembe.2020.151396", // NIVA
  "10.1007/978-3-319-46425-1_1",
  "10.1038/s41598-018-26711-y",
  "10.1002/etc.4020", // NIVA
  "10.1080/13669877.2017.1372509", //NO
  "10.1115/omae2017-61201", //NO
  "10.1126/science.aaf1703", // Kirstine F. Steffensen
  "10.1023/a:1020167027942", // NIVA
  "10.1016/j.jmarsys.2016.06.004", // NIVA
  "10.1016/j.jhydrol.2015.05.001", // NIVA
  "10.1016/j.marenvres.2012.02.007", // NIVA
  "10.1016/j.jembe.2012.02.021", // NIVA
  "10.1007/s10750-012-1403-7", // NIVA
  "10.1007/s10750-012-1390-8", // NIVA
  "10.1007/s11692-011-9127-6", // Thomas F. Hansen
  "10.1016/j.egypro.2011.02.265", // NIVA
  "10.1002/ieam.48", // NIVA
  "10.1046/j.1365-2095.2002.00201.x", // NO 2002
  "10.1007/s10452-008-9182-y", // NIVA
  "10.1007/s10452-008-9183-x", // NIVA
  "10.1016/j.yrtph.2008.04.001", // NIVA
  "10.1016/0160-4120(94)90068-X", // NIVA
  "10.1016/s1385-1101(97)00004-x", // NIVA
  "10.1017/s0025315400032653", // NIVA
  "10.4315/0362-028X-68.7.1336",
  "10.1023/a:1020315817235", // NIVA
  "10.1016/s0048-9697(02)00485-0", // RU
  "10.1016/j.marenvres.2005.08.003", // NIVA
  "10.1080/15287390500259392", // NIVA
  "10.2166/ws.2004.0060",
  "10.1002/rcm.2258", //NILU
  "10.1016/S0044-8486(02)00584-7", // NO
  "10.1016/j.aquaculture.2005.01.016", // NO
  "10.1111/j.1095-8649.2002.tb02481.x",
  "10.1016/j.chroma.2004.11.059", // NILU
  "10.1080/00364820310003244", // NIVA
  "10.1016/j.cbpa.2008.07.019", // NO
];

const delHandles: string[] = [
  //"11250/2739211", // Only NIVA?
];

const delIds: string[] = [
  "https://api.test.nva.aws.unit.no/publication/0191fb0f7c77-cf85b072-7a07-4953-982f-4f0ea73d8cb8",
  // 2 Akvaplan-in in Cristin? "https://api.test.nva.aws.unit.no/publication/01907a90bca9-9b582398-b110-4af9-8200-11b20afec801",
];

export const removeUnwarranted = async () => {
  const pubkeys = delDois.map((doi) => ["pub", doiUrlString(doi)]);
  await deleteMany(pubkeys);
  const crossrefkeys = delDois.map((doi) => ["crossref", doi]);
  await deleteMany(crossrefkeys);

  const handleKeys = delHandles.map((
    hdl,
  ) => ["pub", new URL(hdl, "https://hdl.handle.net").href]);
  await deleteMany(handleKeys);

  const idKeys = delIds.map((
    id,
  ) => ["pub", id]);
  await deleteMany(idKeys);

  const idkeys = [...pubkeys, ...handleKeys, ...idKeys];
  for (const [, id] of idkeys) {
    const key = ["reject", id];
    await kv.set(key, "removeUnwarranted");
  }
};

if (import.meta.main) {
  removeUnwarranted();
}
