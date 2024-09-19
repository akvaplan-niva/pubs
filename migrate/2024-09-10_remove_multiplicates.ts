#!/usr/bin/env -S deno run --env-file --allow-env --allow-net
import { kv } from "../kv/kv.ts";
import { deletePub } from "../kv/pub.ts";

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
];

export const removeMultiplicates = async () => {
  for await (const id of remove) {
    await deletePub(id);
    const key = ["reject", id];
    await kv.set(key, "removeMultiplicates");
  }
};

if (import.meta.main) {
  removeMultiplicates();
}
