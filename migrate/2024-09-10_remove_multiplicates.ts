#!/usr/bin/env -S deno run --env-file --allow-env --allow-net
import { kv } from "../kv/kv.ts";
import { deletePub } from "../pub/pub.ts";

const remove = [
  "https://doi.org/10.1007/978-3-030-10618-8_12-1", // "https://doi.org/10.1007/978-3-030-39041-9_12", "Effects of Biofouling on the Sinking Behavior of Microplastics in Aquatic Environments"
  //"https://doi.org/10.1007/978-94-009-3103-9_9", //<- chapter | article-> "https://doi.org/10.1007/bf00026297", "The lipid biochemistry of calanoid copepods"
  //"https://doi.org/10.1007/978-94-017-1907-0_11", //<- chapter | article-> "https://doi.org/10.1023/a:1003013725472","Soft-bottom macro invertebrate fauna of North Norwegian coastal waters with particular reference to sill-basins. Part one: Bottom topography and species diversity"]
  //"https://doi.org/10.1007/978-94-017-1907-0_13", //<- chapter | article-> "https://doi.org/10.1023/a:1003009524563","Sensitivity to stress in the bivalve Macoma balthica from the most northern (Arctic) to the most southern (French) populations: low sensitivity in Arctic populations because of genetic adaptations?"]
  "https://doi.org/10.1007/s003000050088", // "https://doi.org/10.1007/bf02329051", "Some macrofaunal effects of local pollution and glacier-induced sedimentation, with indicative chemical analyses, in the sediments of two Arctic fjords"]
  "https://doi.org/10.1016/j.seares.2023.102379", //<- erratum | article-> "https://doi.org/10.1016/j.seares.2018.03.006","Altricial-precocial spectra in animal kingdom"]
  // Polar research 404 from 10.1111/j.1751-8369.*
  "https://doi.org/10.1111/j.1751-8369.1994.tb00440.x", // "https://doi.org/10.3402/polar.v13i1.6684","Studies of sea surface temperatures in selected northern Norwegian fjords using Landsat TM data"]
  "https://doi.org/10.1111/j.1751-8369.2002.tb00073.x", // "https://doi.org/10.3402/polar.v21i1.6480","The marine ecosystem of Kongsfjorden, Svalbard"]
  "https://doi.org/10.1111/j.1751-8369.2004.tb00128.x", // "https://doi.org/10.3402/polar.v23i1.6265","Lipids and trophic linkages in harp seal (Phoca groenlandica) from the eastern Barents Sea"]
  "https://doi.org/10.1111/j.1751-8369.2005.tb00144.x", // "https://doi.org/10.3402/polar.v24i1.6257","Polar bivalves are characterized by high antioxidant defences"]
  "https://hdl.handle.net/10037/32358", // UiT version of https://hdl.handle.net/11250/3109447
  "https://api.test.nva.aws.unit.no/publication/0190a6943283-fa38d3a3-7932-46db-bdfc-05effd221718", //UiT version of https://hdl.handle.net/11250/3109447
  "https://api.test.nva.aws.unit.no/publication/01907a662567-ce61fa65-b0f2-4eaf-bcae-0cfd730b9273", // duplicate (missing doi) of https://doi.org/10.1007/s00300-006-0183-9
  "https://api.test.nva.aws.unit.no/publication/0190936c4d5c-7b19b58b-dc69-490c-92bd-fb9faa7d717b", // duplicate of https://hdl.handle.net/11250/2615018
  "https://api.test.nva.aws.unit.no/publication/0190a1c855c4-405ad42e-ae30-45c9-9732-20f8c7adcccb", // duplcate of https://hdl.handle.net/10037/5926
  "https://api.test.nva.aws.unit.no/publication/0190a19baa21-d026e318-ae3b-41e4-8d73-9497ab8e83b5", // duplicate of https://hdl.handle.net/10037/29393
];

export const removeMultiplicates = async () => {
  let i = 0;
  for await (const id of remove) {
    await deletePub(id, { by: true });
    const key = ["reject", id];
    await kv.set(key, "removeMultiplicates");
    console.warn(i++, id);
  }
};

if (import.meta.main) {
  removeMultiplicates();
}

// ~/akvaplan-niva/pubs$ ./kv/_list.ts pub | nd-map d.value | nd-filter '!/conference/i.test(d.type)' | nd-map --select title | nd-count | nd-filter 'd.count>2'  # | nd-sort --reverse --numeric --on count
// {"title":"A review of the culture potential of spotted wolffish Anarhichas minor Olafsen","count":3}
// {"title":"Evolusjon og artsdannelse i nord-norske innsjøer","count":3}
// {"title":"Shell growth and environmental control of methanophyllic Thyasirid bivalves from Svalbard cold seeps","count":3}
// {"title":"The effect of temperature and fish size on growth of juvenile lumpfish (Cyclopterus lumpus L.)","count":3}

// che@:~/akvaplan-niva/pubs$ ./kv/_list.ts pub | nd-map d.value | nd-map --select title | nd-count | nd-filter 'd.count>2' | nd-sort --reverse --numeric --on count
// {"title":"Nutrients vs. turbulence, and the future of Arctic Ocean primary production","count":5}
// {"title":"Developmental effects of embryonic exposure to a water-soluble fraction of crude oil on early life stages of capelin (Mallotus villosus)","count":3}
// {"title":"Plastic ingestion and associated additives in Faroe Islands chicks of the Northern Fulmar Fulmarus glacialis","count":3}
// {"title":"Differential methane oxidation activity and microbial community composition at cold seeps in the Arctic off western Svalbard","count":3}
// {"title":"A review of the culture potential of spotted wolffish Anarhichas minor Olafsen","count":3}
// {"title":"Arctic zooplankton in changing marine lightscape","count":3}
// {"title":"Combined effects of ocean acidification, ocean warming and oil related discharges","count":3}
// {"title":"Evolusjon og artsdannelse i nord-norske innsjøer","count":3}
// {"title":"Shell growth and environmental control of methanophyllic Thyasirid bivalves from Svalbard cold seeps","count":3}
// {"title":"In silico and experimental screening platform for characterizing environmental impact of industrial development in the Arctic – an overview of the project EXPECT","count":3}
// {"title":"Seasonal variability and fluxes of nitrate in the surface waters over the Arctic shelf slope","count":3}
// {"title":"The effect of temperature and fish size on growth of juvenile lumpfish (Cyclopterus lumpus L.)","count":3}
