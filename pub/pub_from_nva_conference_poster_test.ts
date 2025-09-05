import { assertEquals } from "@std/assert";
import { pubFromNva } from "./pub_from_nva.ts";
import conferencePoster from "./_test/nva_conference_poster.json" with {
  type: "json",
};
Deno.test("NVA", async (t) => {
  await t.step("Conference Poster", async () => {
    assertEquals(await pubFromNva(conferencePoster), {
      authors: [
        {
          name: "Martta Viljanen",
        },
        {
          name: "Sanna Kristiina Majaneva",
        },
        {
          name: "Markus Majaneva",
        },
        {
          name: "Malin Hildegard Elisabeth Daase",
        },
        {
          name: "Geir Johnsen",
        },
        {
          name: "Kristian Donner",
        },
        {
          name: "Magnus Lindström",
        },
      ],
      container: "Arctic Frontiers 2024 ACTIONS & REACTIONS",
      contributors: undefined,
      created: new Date("2024-07-03T21:56:35.146Z"),
      doi: undefined,
      id:
        "https://api.test.nva.aws.unit.no/publication/01907a9972ca-697809e8-70b3-480e-aa14-29a1a25ca23c",
      modified: new Date("2024-08-29T18:06:53.393Z"),
      nva: "01907a9972ca-697809e8-70b3-480e-aa14-29a1a25ca23c",
      parent: undefined,
      published: "2024-01-29/2024-02-01",
      title: "Arctic zooplankton in changing marine lightscape",
      type: "ConferencePoster",
      url: undefined,
      projects: [
        {
          cristin: 2559966,
          name: undefined,
          type: "ResearchProject",
        },
      ],
    });
  });
});
