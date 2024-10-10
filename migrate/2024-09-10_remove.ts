#!/usr/bin/env -S deno run --env-file --allow-env --allow-net
import { doiUrlString } from "../doi/url.ts";
import { deleteKeysAtomic, kv } from "../kv/kv.ts";
import { deletePub } from "../pub/pub.ts";

// Many of these are mis-attributed Akvaplan-niva by OpenAlex, when containing only NIVAists, like: https://doi.org/10.1016/j.ecoenv.2021.112585
export const deleteDoiNames = [
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

const deletePubIds: string[] = [
  "https://api.test.nva.aws.unit.no/publication/0191fb0f7c77-cf85b072-7a07-4953-982f-4f0ea73d8cb8",
  // 2 Akvaplan in Cristin? "https://api.test.nva.aws.unit.no/publication/01907a90bca9-9b582398-b110-4af9-8200-11b20afec801",

  // Same name, but not our Anders Eilertsen (aei):
  "http://hdl.handle.net/11250/2467041",
  "https://hdl.handle.net/11250/2647209",
  "https://api.test.nva.aws.unit.no/publication/0190b80e2d3e-8f7fb51c-669a-4977-bda5-0f74aa52b701",
  //duplicate of https://doi.org/10.1016/j.ecss.2005.12.006:
  "https://api.test.nva.aws.unit.no/publication/01907a924743-fc69947b-6562-4ec2-8152-5263abe6e2ef",
  // Not our Sondre Pedersen:
  "https://hdl.handle.net/11250/3080510",
  "https://hdl.handle.net/10037/4458",
  "https://hdl.handle.net/11250/3014939",
  "https://api.test.nva.aws.unit.no/publication/0190b613eee8-99ba0dc9-386d-4cbd-8a09-1b7990d05458",
  "https://api.test.nva.aws.unit.no/publication/0190a19e285a-849e5d2f-e1cb-42a4-9294-96f1b2738979",
  "https://api.test.nva.aws.unit.no/publication/0190b69139e3-22b1874c-874f-4c9c-a974-527054e181e2",
  "https://api.test.nva.aws.unit.no/publication/0190b69139e3-22b1874c-874f-4c9c-a974-527054e181e2", // master om lakselus => same as https://munin.uit.no/bitstream/handle/10037/22609/thesis.pdf?sequence=2&isAllowed=y
  "https://hdl.handle.net/10037/22609",

  // Incomplete/test metadata for: Kunnskapsgrunnlag for nye arter i oppdrett – Del 2
  "https://api.test.nva.aws.unit.no/publication/0191a2e1f31a-cfc03007-918e-4dd2-8ee4-5e51be075ab7",
  // Only NIVA?
  //"https://hdl.handle.net/11250/2739211",

  // Not our Jesper Hansen:
  "https://doi.org/10.1038/s41586-024-07044-5",
  "https://doi.org/10.1002/cncr.34350",

  // Unknown author
  "https://hdl.handle.net/11250/3091518",

  // NIVA
  "https://hdl.handle.net/11250/2739211",

  //Not our Mina Hansen:
  "https://api.test.nva.aws.unit.no/publication/01909971201b-01393776-c758-4d56-bb0a-e6688eced625",
  "https://api.test.nva.aws.unit.no/publication/0190b73700f1-459b0622-4471-4e44-86a6-c9a8ea9b3da2",
  "https://hdl.handle.net/11250/218191",
];

export const removeUnwarranted = async () => {
  for (const doi of deleteDoiNames) {
    const id = doiUrlString(doi);
    await deletePub(id, { by: true });
    await kv.delete(["crossref", doi]);
    await kv.set(["reject", id], "removeUnwarranted");
  }

  for (const id of deletePubIds) {
    await deletePub(id, { by: true });
    await kv.set(["reject", id], "removeUnwarranted");
  }
};

if (import.meta.main) {
  removeUnwarranted();
}
