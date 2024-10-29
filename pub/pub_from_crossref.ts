import type { CrossrefWork } from "../crossref/types.ts";
import { doiUrlString } from "../doi/url.ts";
import type { Pub } from "./types.ts";

const dateFromParts = (p: [number, number, number?]) =>
  p.map((n, i) => 0 === i ? String(n) : String(n).padStart(2, "0")).join("-");

const nvaTypeFromWorkType = (type: string) => {
  switch (type) {
    case "journal-article":
      return "AcademicArticle";
    default:
      return type;
  }
};

export const pubFromCrossrefWork = (work: CrossrefWork) => {
  const doi = work.DOI;
  const id = doiUrlString(doi);
  const type = nvaTypeFromWorkType(work.type);
  const [title] = work?.title;
  const [container] = work?.["container-title"];
  const authors = work.author?.map(({ family, given }) => (
    { family: family?.replace(/[0-9\*]/, ""), given }
  ));
  const pubParts = (work.published ?? work.created)?.["date-parts"].at(0);
  const published = pubParts && pubParts?.length > 0
    ? dateFromParts(pubParts)
    : null;

  if (!published) {
    console.error(work);
    throw new RangeError("No published date");
  }

  const d = structuredClone(work);
  const cc = d.license?.map(({ URL }: { URL: string }) => URL).find((
    url: string,
  ) => /creativecommons\.org/.test(url));
  const match = cc && cc.match(/\/(licenses|publicdomain)\/(?<code>[^/]+)/);
  const license = match && match.groups ? `cc-${match.groups.code}` : undefined;
  const created = new Date(work.created?.["date-time"]);
  const modified = new Date(work.indexed?.["date-time"]);

  const pub: Pub = {
    id,
    doi,
    title,
    authors,
    container,
    published,
    type,
    license,
    reg: "Crossref",
    created,
    modified,
  };
  return pub;
};

// type = "preprint" === d?.subtype ? d.subtype : d.type,
// type = /errat(um|a)/i.test(title) ? "erratum": type,

// // online = d["published-online"] ? d["published-online"]["date-parts"][0] : [],
// // _print = d["published-print"] ? d["published-print"]["date-parts"][0] : [],
// // _published = d["published"] ? d["published"]["date-parts"][0] : [],
// // dates = [iso(online),iso(_print),iso(_published)].filter(s=>s?.length>=4),

// cites = d["is-referenced-by-count"],
