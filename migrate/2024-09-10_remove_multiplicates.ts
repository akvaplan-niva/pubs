// #!/usr/bin/env -S deno run --env-file --allow-env --allow-net
// // $ ./kv/_list.ts pub | nd-map d.value | nd-group d.title | nd-filter 'd[1].length>1' | nd-map 'mx = d[1].map( ({container,published,type,id}) => [id, container, published, type]), [d[0], mx]'
const _reject = [
  "https://doi.org/10.1007/978-3-030-10618-8_12-1", //"https://doi.org/10.1007/978-3-030-39041-9_12",
];
const _mx = [["The lipid biochemistry of calanoid copepods", [[
  "https://doi.org/10.1007/978-94-009-3103-9_9",
  "Biology of Copepods",
  "1988",
  "book-chapter",
], [
  "https://doi.org/10.1007/bf00026297",
  "Hydrobiologia",
  "1988-10",
  "journal-article",
]]], [
  "Soft-bottom macro invertebrate fauna of North Norwegian coastal waters with particular reference to sill-basins. Part one: Bottom topography and species diversity",
  [[
    "https://doi.org/10.1007/978-94-017-1907-0_11",
    "Interactions and Adaptation Strategies of Marine Organisms",
    "1997",
    "book-chapter",
  ], [
    "https://doi.org/10.1023/a:1003013725472",
    "Hydrobiologia",
    "1997",
    "journal-article",
  ]],
], [
  "Sensitivity to stress in the bivalve Macoma balthica from the most northern (Arctic) to the most southern (French) populations: low sensitivity in Arctic populations because of genetic adaptations?",
  [[
    "https://doi.org/10.1007/978-94-017-1907-0_13",
    "Interactions and Adaptation Strategies of Marine Organisms",
    "1997",
    "book-chapter",
  ], [
    "https://doi.org/10.1023/a:1003009524563",
    "Hydrobiologia",
    "1997",
    "journal-article",
  ]],
], [
  "Some macrofaunal effects of local pollution and glacier-induced sedimentation, with indicative chemical analyses, in the sediments of two Arctic fjords",
  [[
    "https://doi.org/10.1007/bf02329051",
    "Polar Biology",
    "1996-10",
    "journal-article",
  ], [
    "https://doi.org/10.1007/s003000050088",
    "Polar Biology",
    "1996-09-16",
    "journal-article",
  ]],
], ["Altricial-precocial spectra in animal kingdom", [[
  "https://doi.org/10.1016/j.seares.2018.03.006",
  "Journal of Sea Research",
  "2019-01",
  "journal-article",
], [
  "https://doi.org/10.1016/j.seares.2023.102379",
  "Journal of Sea Research",
  "2023-06",
  "erratum",
]]], [
  "Studies of sea surface temperatures in selected northern Norwegian fjords using Landsat TM data",
  [[
    "https://doi.org/10.1111/j.1751-8369.1994.tb00440.x",
    "Polar Research",
    "1994-06",
    "journal-article",
  ], [
    "https://doi.org/10.3402/polar.v13i1.6684",
    "Polar Research",
    "1994-01-06",
    "journal-article",
  ]],
], ["The marine ecosystem of Kongsfjorden, Svalbard", [[
  "https://doi.org/10.1111/j.1751-8369.2002.tb00073.x",
  "Polar Research",
  "2002-06",
  "journal-article",
], [
  "https://doi.org/10.3402/polar.v21i1.6480",
  "Polar Research",
  "2002-01-06",
  "journal-article",
]]], [
  "Lipids and trophic linkages in harp seal (Phoca groenlandica) from the eastern Barents Sea",
  [[
    "https://doi.org/10.1111/j.1751-8369.2004.tb00128.x",
    "Polar Research",
    "2004-06",
    "journal-article",
  ], [
    "https://doi.org/10.3402/polar.v23i1.6265",
    "Polar Research",
    "2004-06",
    "journal-article",
  ]],
], ["Polar bivalves are characterized by high antioxidant defences", [[
  "https://doi.org/10.1111/j.1751-8369.2005.tb00144.x",
  "Polar Research",
  "2005-07",
  "journal-article",
], [
  "https://doi.org/10.3402/polar.v24i1.6257",
  "Polar Research",
  "2005-07",
  "journal-article",
]]]];
