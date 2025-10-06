import { assertObjectMatch } from "@std/assert";
import { pubFromNva } from "./pub_from_nva.ts";
import nva from "./_test/nva_academic_article.json" with {
  type: "json",
};
const exp = {
  "id": "https://doi.org/10.1093/plankt/fbm003",
  "nva": "0198cc82256e-a7225f74-8d28-4ca9-abde-ccfefe6109b7",
  "title":
    "Causes for mass occurrences of the jellyfish Periphylla periphylla: a hypothesis that involves optically conditioned retention",
  "type": "AcademicArticle",
  "published": "2007",
  "container": "Journal of Plankton Research",
  "authors": [
    { "family": "Sørnes", "given": "Tom Asbjørn" },
    { "family": "Aksnes", "given": "Dag Lorents" },
    { "family": "Båmstedt", "given": "Ulf" },
    { "name": "Marsh J. Youngbluth" },
  ],
  "created": new Date("2025-08-21T12:02:18.094Z"),
  "modified": new Date("2025-08-21T12:02:18.094Z"),
};

Deno.test("NVA", async (t) => {
  await t.step("Academic article", async () => {
    const pub = await pubFromNva(nva);
    assertObjectMatch(pub, exp);
  });
});
