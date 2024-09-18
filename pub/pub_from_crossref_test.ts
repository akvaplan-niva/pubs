import { assertEquals } from "@std/assert";
import { pubFromCrossrefWork } from "./pub_from_crossref.ts";

const work = JSON.parse(
  `{"indexed":{"date-parts":[[2024,8,1]],"date-time":"2024-08-01T00:34:50Z","timestamp":1722472490157},"reference-count":118,"publisher":"Wiley","license":[{"start":{"date-parts":[[2024,7,30]],"date-time":"2024-07-30T00:00:00Z","timestamp":1722297600000},"content-version":"vor","delay-in-days":0,"URL":"http://creativecommons.org/licenses/by/4.0/"}],"funder":[{"DOI":"10.13039/501100010197","name":"Fiskeri - og havbruksnæringens forskningsfond","doi-asserted-by":"publisher","award":["FHF 901890"],"id":[{"id":"10.13039/501100010197","id-type":"DOI","asserted-by":"publisher"}]}],"content-domain":{"domain":["onlinelibrary.wiley.com"],"crossmark-restriction":true},"short-container-title":["Reviews in Aquaculture"],"abstract":"<jats:title>Abstract</jats:title><jats:p>In 2017, a new regulatory management system, the traffic light system (TLS), was implemented to estimate the effects of salmon lice from Norwegian salmon aquaculture on marine survival of wild Atlantic salmon and forms the basis of aquaculture capacity regulation. The TLS relies on observational data and a set of models to estimate the risk for negative impact on wild salmon populations. This review of the literature that forms the basis for the TLS as well as other relevant studies is presented in the context of the currently practiced TLS and suggestions are made for immediate and long‐term improvements. The main findings of this review are that: (1) assumed timing and duration of smolt migration contribute to unreliable observational and modelled data and overestimates of infection pressure; (2) production of lice larvae from farmed salmon is overestimated; (3) TLS model systems rely on or are calibrated by the same potentially flawed data; (4) lice‐associated mortality in wild salmon smolts may be overestimated; and (5) lice infection levels on farms are not associated with measurable effects on wild salmon. Recommendations to improve the accuracy and reliability of the TLS, and hence its environmental efficiency include the more complete use of available biological and physical environmental variables, adjusting the time period that observational data are registered and modelled data are integrated, adjusting the interpretation of data including recognition of uncertainty in model outcomes, and use of more realistic assumptions concerning lice‐induced mortality thresholds.</jats:p>","DOI":"10.1111/raq.12953","type":"journal-article","created":{"date-parts":[[2024,7,31]],"date-time":"2024-07-31T02:38:53Z","timestamp":1722393533000},"update-policy":"http://dx.doi.org/10.1002/crossmark_policy","source":"Crossref","is-referenced-by-count":0,"title":["Salmon lice biology, environmental factors, and smolt behaviour with implications for the Norwegian salmon farming management system: A critical review"],"prefix":"10.1111","author":[{"given":"Solveig","family":"van Nes","sequence":"first","affiliation":[{"name":"Marine Prospects AS  Oslo Norway"}]},{"ORCID":"http://orcid.org/0000-0003-0077-8077","authenticated-orcid":false,"given":"Albert Kjartan Dagbjartarson","family":"Imsland","sequence":"additional","affiliation":[{"name":"Akvaplan‐niva Iceland Office  Kópavogur Iceland"},{"name":"Department of Biological Sciences University of Bergen, High Technology Centre  Bergen Norway"}]},{"ORCID":"http://orcid.org/0000-0002-8800-9653","authenticated-orcid":false,"given":"Simon R. M.","family":"Jones","sequence":"additional","affiliation":[{"name":"Fisheries and Oceans Canada, Pacific Biological Station  Nanaimo British Columbia Canada"}]}],"member":"311","published-online":{"date-parts":[[2024,7,30]]},"reference":[],"container-title":["Reviews in Aquaculture"],"original-title":[],"language":"en","link":[{"URL":"https://onlinelibrary.wiley.com/doi/pdf/10.1111/raq.12953","content-type":"unspecified","content-version":"vor","intended-application":"similarity-checking"}],"deposited":{"date-parts":[[2024,7,31]],"date-time":"2024-07-31T02:39:15Z","timestamp":1722393555000},"score":1,"resource":{"primary":{"URL":"https://onlinelibrary.wiley.com/doi/10.1111/raq.12953"}},"subtitle":[],"short-title":[],"issued":{"date-parts":[[2024,7,30]]},"references-count":118,"alternative-id":["10.1111/raq.12953"],"URL":"http://dx.doi.org/10.1111/raq.12953","archive":["Portico"],"relation":{},"ISSN":["1753-5123","1753-5131"],"issn-type":[{"value":"1753-5123","type":"print"},{"value":"1753-5131","type":"electronic"}],"subject":[],"published":{"date-parts":[[2024,7,30]]},"assertion":[{"value":"2024-01-16","order":0,"name":"received","label":"Received","group":{"name":"publication_history","label":"Publication History"}},{"value":"2024-06-27","order":2,"name":"accepted","label":"Accepted","group":{"name":"publication_history","label":"Publication History"}},{"value":"2024-07-30","order":3,"name":"published","label":"Published","group":{"name":"publication_history","label":"Publication History"}}]}`,
);

const expected = {
  id: "https://doi.org/10.1111/raq.12953",
  doi: "10.1111/raq.12953",
  title:
    "Salmon lice biology, environmental factors, and smolt behaviour with implications for the Norwegian salmon farming management system: A critical review",
  authors: [
    { family: "van Nes", given: "Solveig" },
    {
      family: "Imsland",
      given: "Albert Kjartan Dagbjartarson",
    },
    { family: "Jones", given: "Simon R. M." },
  ],
  container: "Reviews in Aquaculture",
  published: "2024-07-30",
  type: "journal-article",
  reg: "Crossref",
  license: "cc-by",
  created: new Date("2024-07-31T02:38:53Z"),
  modified: new Date("2024-08-01T00:34:50Z"),
};

Deno.test("pubFromCrossrefWork", () =>
  assertEquals(pubFromCrossrefWork(work), expected));
