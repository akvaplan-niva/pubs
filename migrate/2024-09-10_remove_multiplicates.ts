#!/usr/bin/env -S deno run --env-file --allow-env --allow-net
import { kv } from "../kv/kv.ts";
import { deletePub } from "../pub/pub.ts";

// FIXME @todo! NOT a duplicate: https://api.test.nva.aws.unit.no/publication/01907a755bf0-9facf6eb-6c75-49ab-92d4-df856d113fb0 01907a755bf0-9facf6eb-6c75-49ab-92d4-df856d113fb0
// Remove from this list, and remove from rejct, then add (puh)
const remove = [
  // "https://doi.org/10.1007/978-3-030-10618-8_12-1", // "https://doi.org/10.1007/978-3-030-39041-9_12", "Effects of Biofouling on the Sinking Behavior of Microplastics in Aquatic Environments"
  // //"https://doi.org/10.1007/978-94-009-3103-9_9", //<- chapter | article-> "https://doi.org/10.1007/bf00026297", "The lipid biochemistry of calanoid copepods"
  // //"https://doi.org/10.1007/978-94-017-1907-0_11", //<- chapter | article-> "https://doi.org/10.1023/a:1003013725472","Soft-bottom macro invertebrate fauna of North Norwegian coastal waters with particular reference to sill-basins. Part one: Bottom topography and species diversity"]
  // //"https://doi.org/10.1007/978-94-017-1907-0_13", //<- chapter | article-> "https://doi.org/10.1023/a:1003009524563","Sensitivity to stress in the bivalve Macoma balthica from the most northern (Arctic) to the most southern (French) populations: low sensitivity in Arctic populations because of genetic adaptations?"]
  // "https://doi.org/10.1007/s003000050088", // "https://doi.org/10.1007/bf02329051", "Some macrofaunal effects of local pollution and glacier-induced sedimentation, with indicative chemical analyses, in the sediments of two Arctic fjords"]
  // "https://doi.org/10.1016/j.seares.2023.102379", //<- erratum | article-> "https://doi.org/10.1016/j.seares.2018.03.006","Altricial-precocial spectra in animal kingdom"]
  // // Polar research 404 from 10.1111/j.1751-8369.*
  // "https://doi.org/10.1111/j.1751-8369.1994.tb00440.x", // "https://doi.org/10.3402/polar.v13i1.6684","Studies of sea surface temperatures in selected northern Norwegian fjords using Landsat TM data"]
  // "https://doi.org/10.1111/j.1751-8369.2002.tb00073.x", // "https://doi.org/10.3402/polar.v21i1.6480","The marine ecosystem of Kongsfjorden, Svalbard"]
  // "https://doi.org/10.1111/j.1751-8369.2004.tb00128.x", // "https://doi.org/10.3402/polar.v23i1.6265","Lipids and trophic linkages in harp seal (Phoca groenlandica) from the eastern Barents Sea"]
  // "https://doi.org/10.1111/j.1751-8369.2005.tb00144.x", // "https://doi.org/10.3402/polar.v24i1.6257","Polar bivalves are characterized by high antioxidant defences"]
  // "https://hdl.handle.net/10037/32358", // UiT version of https://hdl.handle.net/11250/3109447
  // "https://api.test.nva.aws.unit.no/publication/0190a6943283-fa38d3a3-7932-46db-bdfc-05effd221718", //UiT version of https://hdl.handle.net/11250/3109447
  // "https://api.test.nva.aws.unit.no/publication/01907a662567-ce61fa65-b0f2-4eaf-bcae-0cfd730b9273", // duplicate (missing doi) of https://doi.org/10.1007/s00300-006-0183-9
  // "https://api.test.nva.aws.unit.no/publication/0190936c4d5c-7b19b58b-dc69-490c-92bd-fb9faa7d717b", // duplicate of https://hdl.handle.net/11250/2615018
  // "https://api.test.nva.aws.unit.no/publication/0190a1c855c4-405ad42e-ae30-45c9-9732-20f8c7adcccb", // duplcate of https://hdl.handle.net/10037/5926
  // "https://api.test.nva.aws.unit.no/publication/0190a19baa21-d026e318-ae3b-41e4-8d73-9497ab8e83b5", // duplicate of https://hdl.handle.net/10037/29393
  // "https://api.test.nva.aws.unit.no/publication/01907a8451bc-3531f717-b6ed-4f98-84a4-468f81929abd", // duplicate of https://hdl.handle.net/11250/2584689
  // "https://api.test.nva.aws.unit.no/publication/0190a199b88f-142ebf9b-abbf-40b4-b398-39d5ef6fc809", // duplicate of https://hdl.handle.net/10037/9993
  // "https://doi.org/10.1111/j.1095-8649.2004.00564.x", // Wrong/nonexisting DOI: "https://doi.org/10.1111/j.0022-1112.2004.00564.x",
  // "https://api.test.nva.aws.unit.no/publication/01907a7472bf-9ab7fd3c-6dc3-47a2-84be-a812af895f49", // DOI: https://doi.org/10.1007/s11160-004-8360-9
  // "https://api.test.nva.aws.unit.no/publication/01907a6dc5d4-44e9c6f5-be21-4e43-b667-bfc1e0bb9d24", // DOI: https://doi.org/10.1007/s11160-004-8360-9
  "https://doi.org/10.21334/npolar.2023.f361dff9", // Dataset DOI for https://doi.org/10.1186/s40317-023-00323-4
];

export const removeMultiplicates = async () => {
  let i = 0;
  for await (const id of remove) {
    await deletePub(id);
    const key = ["reject", id];
    await kv.set(key, "removeMultiplicates");
    console.warn(i++, id);
  }
};

// const removeRejectedFromBy = async () => {
//   let i = 0;
//   const ids = new Set();
//   for await (const { key: [, id] } of kv.list({ prefix: ["reject"] })) {
//     ids.add(id);
//   }

// };

if (import.meta.main) {
  removeMultiplicates();
}
// Same title,type,year:
// ./kv/_list.ts pub | nd-map d.value | nd-map --select 'title,type,published' | nd-map '{published,...r}=d,d.year=d.published.substring(0,4),r' | nd-count | nd-filter 'd.count>1' | nd-sort --reverse --numeric --on count > data/dups.ndjson

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

//./kv/_list.ts pub | nd-map d.value | nd-map --select title,type | nd-count | nd-filter 'd.count>1' | nd-sort --reverse --numeric --on count | nd-map --select title,type  | nd-group d.type | nd-map '[d[0], d[1].map( ({title}) => title)]'

const ConferenceLecture =
  `["Combined effects of ocean acidification, ocean warming and oil related discharges","Towards a holistic view of a lake food web - the importance of including benthic habitats and parasites","Illuminating zooplankton diel vertical migration with eDNA metabarcoding in the polar night","Were Novaya Zemlya and the Barents Sea ice free about 30 ka?","Tracking Fish in the Open Ocean and Polar Regions"]`;
// ["Lecture",["Evolusjon og artsdannelse i nord-norske innsjøer","Shell growth and environmental control of methanophyllic Thyasirid bivalves from Svalbard cold seeps","”Mater et magistra”: Kurs i PMTO for somaliske og pakistanske mødre","Differential methane oxidation activity and microbial community composition at cold seeps in the Arctic off western Svalbard","Seasonal and depth-dependent growth of cultivated kelp (Saccharina latissima) in close proximity to salmon (Salmo salar) aquaculture in Norway","High Arctic cold seeps: visual and acoustic imagery reveal spatial heterogeneity in megafaunal communities and sediment geochemistry"]]
// ["ConferencePoster",["In silico and experimental screening platform for characterizing environmental impact of industrial development in the Arctic – an overview of the project EXPECT","Isotopic turnover in polar cod (Boreogadus saida) muscle determined through a controlled feeding experiment","Arctic zooplankton in changing marine lightscape","Climate reconstruction from a methane influenced environment","Nutrients vs. turbulence, and the future of Arctic Ocean primary production","Trophic relationships and community structure at cold seeps in the Barents Sea"]]
// ["AcademicArticle",["The relation between age at first maturity and growth in Atlantic halibut (Hippoglossus hippoglossus) reared at four different light regimes","Linking population genetics and growth properties of Atlantic cod","Gill Na+, K+-ATPase activity, plasma chloride and osmolality in juvenile turbot (Scophthalmus maximus) reared at different temperatures and salinities","Nuclear DNA RFLP variation of Atlantic cod in the North Atlantic Ocean","Effects of size grading on growth and survival of juvenile turbot at two temperatures","Trophic transfer and trophic modification of fatty acids in high Arctic lakes","Variations in growth in haemoglobin genotypes of Atlantic cod","Alterations in the energy budget of Arctic benthic species exposed to oil-related compounds","Effects of changes in ambient PAR and UV radiation on the nutritional quality of an Arctic diatom (Thalassiosira antarctica var. borealis)","A review of the culture potential of spotted wolffish Anarhichas minor Olafsen","Does malpigmentation improve growth in juvenile turbot (Scophthalmus maximus Rafinesque) and halibut (Hippoglossus hippoglossus L.)?","Biomarker responses and PAH uptake in Mya truncata following exposure to oil-contaminated sediment in an Arctic fjord (Svalbard)","Serosurvey for Toxoplasma gondii in arctic foxes and possible sources of infection in the high Arctic of Svalbard","Selection or adaptation: Differences in growth performance of juvenile turbot (Scophthalmus maximus Rafinesque) from two close-by localities off Norway","Intensity of parasitic nematodes increases with organochlorine levels in the glaucous gull","A multi-generation Calanus finmarchicus culturing system for use in long-term oil exposure experiments","Total oxyradical scavenging capacity and cell membrane stability of haemocytes of the Arctic scallop, Chlamys islandicus, following benzo(a)pyrene exposure","PCBs, PBDEs and pesticides released to the Arctic Ocean by the Russian Rivers Ob and Yenisei","Ultraviolet radiation negatively affects growth but not food quality of arctic diatoms","Discharges of nuclear waste into the Kola Bay and its impact on human radiological doses","Effects of water reuse and stocking density on water quality, blood physiology and growth rate of juvenile cod (Gadus morhua)","Growth, feed conversion efficiency and growth heterogeneity in Atlantic halibut (Hippoglossus hippoglossus) reared at three different photoperiods","Benthic community response to petroleum-associated components in Arctic versus temperate marine sediments","Late Miocene decapods from Gram, Denmark","The interrelation between temperature regimes and fish size in juvenile Atlantic cod (Gadus morhua): effects on growth and feed conversion efficiency","Species sensitivity distributions for suspended clays, sediment burial, and grain size change in the marine environment","Biological impacts of ocean acidification: a postgraduate perspective on research priorities","A Late Miocene brissid echionoid from Denmark","Introduction of species of genus Marenzelleria Mensil, 1896 (Polychaeta: Spionidae) in the Don River delta and Taganrog Bay","Light and spectral properties as determinants of C:N:P-ratios in phytoplankton","Short- and long-term differences in growth, feed conversion efficiency and deformities in juvenile Atlantic cod (Gadus morhua) startfed on rotifers or zooplankton","Effects of photoperiod on sex steroids and gonad maturation in Arctic charr","Environmental influences on benthic fauna associations of the Kara Sea (Arctic Russia)","The Toxic Effects of Multiple Persistent Organic Pollutant Exposures on the Post-Hatch Immunity Maturation of Glaucous Gulls","Fractionation of stable isotopes in the Arctic marine copepod Calanus glacialis: Effects on the isotopic composition of marine particulate organic matter","Persistent organic pollutants and mercury in dead and dying glaucous gulls (Larus hyperboreus) at Bjørnøya (Svalbard)","Live chilling of turbot and subsequent effect on behaviour, muscle stiffness, muscle quality, blood gases and chemistry","The interaction of temperature and salinity on growth and food conversion in juvenile turbot (Scophthalmus maximus)"]]
// ["DegreePhd",["Identification of Marine Organisms using Chemotaxonomy and Hyperspectral Imaging"]]
// ["DegreeMaster",["Growth, gill Na+, K+ ATPase activity, plasma chloride and osmolality in juvenile turbot (Scophthalmus maximus L.) reared at different temperatures and salinities"]]
// ["AcademicChapter",["Zooplankton in Kongsfjorden (1996–2016) in Relation to Climate Change","Numerical study towards closed fish farms in waves using two Harmonic Polynomial Cell methods"]]
// ["PopularScienceArticle",["Verdien av en potet"]]
// ["ReportResearch",["Sårbarhetskriterier for marine arter og leveområder - Barentshavet og Lofoten","ØKOFERSK delprogram Nord: Basisovervåking av utvalgte innsjøer i 2017. Overvåking og klassifisering av økologisk tilstand.","Adventdalsdeltaet og fjæreplyttens sesongmessige bruk av det marine habitat"]]
