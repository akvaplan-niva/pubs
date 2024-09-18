#!/usr/bin/env -S deno run --env-file --allow-env --allow-net

import { doiUrlString } from "../doi/url.ts";
import { getPub, updatePub } from "../kv/pub.ts";

const titles = new Map([
  [
    "10.1117/12.165505",
    "Sea surface temperature mapping using Landsat Thematic Mapper data",
  ],
  [
    "10.11646/zoosymposia.2.1.33",
    "Polychaete diversity patterns on two Arctic shelves: impacts of ice and primary production?",
  ],
  [
    "10.11646/zootaxa.4018.3.6",
    "A new genus and family of copepods (Crustacea: Copepoda) parasitic on polychaetes of the genus <em>Jasmineira</em> Langerhans, 1880 (family Sabellidae) in the northeastern Atlantic",
  ],
  [
    "10.11646/zootaxa.4097.3.4",
    "Three new species of <em>Laonice</em> (Polychaete: Spionidae) from West and Southwest Africa",
  ],
  [
    "10.1357/002224007782689094",
    "Rapid consumption of phytoplankton and ice algae by Arctic soft-sediment benthic communities: Evidence using natural and ¹³C-labeled food materials",
  ],
  [
    "10.5194/bg-19-1657-2022",
    "Tidal mixing of estuarine and coastal waters in the western English Channel is a control on spatial and temporal variability in seawater CO₂",
  ],
  [
    "10.5194/bg-2021-166-supplement",
    'Supplementary material to "Tidal mixing of estuarine and coastal waters in the Western English Channel controls spatial and temporal variability in seawater CO₂"',
  ],
  [
    "10.5194/egusphere-egu22-11984",
    "Assessing ecosystem effects of changes to man-made infrastructure in the North Sea",
  ],
]);

const containers = new Map([
  ["10.1021/acs.est.4c02661", "Environmental Science & Technology"],
  ["10.1016/j.ocecoaman.2024.107299", "Ocean & Coastal Management"],
]);

export const fixEscapes = async () => {
  let i = 0;
  for await (const [doi, title] of titles) {
    const pub = await getPub(doiUrlString(doi));
    if (pub && pub.title !== title) {
      pub.title = title;
      const res = await updatePub(pub);
      console.warn({ doi, title }, res);
    }
    ++i;
  }
  console.assert(i === titles.size);

  let j = 0;
  for await (const [doi, container] of containers) {
    const pub = await getPub(doiUrlString(doi));
    if (pub && pub.container !== container) {
      pub.container = container;
      const res = await updatePub(pub);
      console.warn({ doi, container }, res);
    }
    ++j;
  }
  console.assert(j === containers.size);
};

if (import.meta.main) {
  fixEscapes();
}
