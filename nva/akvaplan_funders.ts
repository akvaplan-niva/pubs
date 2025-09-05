import _funders from "./akvaplan_funders.json" with { type: "json" };
import type { NvaFunder } from "./types.ts";

const funders = new Map<string, Pick<NvaFunder, "name">>(
  _funders as [string, NvaFunder][],
);

export const getFunder = async (ident: string) =>
  await Promise.resolve(funders.get(ident));

// const akvaplanFundersInNva = new Set(JSON.parse(`[
//   "AMAP",          "ANDRE",           "ARTSBANK",
//   "CONOCOPHILIPS", "EC/H2020",        "EC/HEU",
//   "EC/FP7",        "EEANORWAYGRANTS", "EI",
//   "ENERGINORGE",   "EQUINOR",         "ERC",
//   "EU",            "EØS",             "FHF",
//   "FRAM",          "FULBRIGHT",       "HAVFORSK",
//   "KLIMA",         "LUNDIN",          "MI",
//   "MILJØDIR",      "NASA",            "NATSCIFOUND",
//   "NFD",           "NFR",             "NILU",
//   "NIVA",          "NM",              "NOFIMA",
//   "NORDFORSK",     "NTNU",            "OED",
//   "OLJEGASS",      "RFF-NORD-NORGE",  "SIGMA2",
//   "SINTEF",        "STATSKOG",        "SVALBARDMILJØ",
//   "TFS",           "TROMS",           "TROMSFINNMARKCOUNTY",
//   "UD",            "UIA",             "UIB",
//   "UIT",           "VENERGI",         "VETENSKAPSRÅDET",
//   "VISTA"
// ]`));

// const buildFunderId = (
//   ident: string,
//   base: URL | string = "https://api.nva.unit.no/cristin/funding-sources/",
// ) => new URL(ident, base).href;

// const getFunderFromNvaApi = async (ident: string) => {
//   const r = await fetch(buildFunderId(ident));
//   if (r?.ok) {
//     return await r.json() as NvaFunder;
//   } else {
//     const { status, statusText } = r;
//     console.error(ident, { status, statusText });
//   }
// };

// const refreshAkvaplanFundersJson = async () => {
//   const newFunders = akvaplanFundersInNva.difference(
//     new Set([...funders.keys()]),
//   ) as Set<string>;
//   console.warn(akvaplanFundersInNva.size, funders.size, newFunders);
//   let found = 0;
//   for await (const identifier of newFunders) {
//     const funder = await getFunderFromNvaApi(identifier);
//     if (funder) {
//       const { name } = funder;
//       console.warn("New funder", { identifier, name });
//       funders.set(decodeURIComponent(identifier), { name });
//       ++found;
//     }
//   }
//   await Deno.writeTextFile(
//     "./nva/akvaplan_funders.json",
//     JSON.stringify([...funders], null, "  "),
//   );
// };

// if (import.meta.main) {
//   refreshAkvaplanFundersJson();
// }
