import { assertEquals } from "@std/assert";
import { pubFromNva } from "./pub_from_nva.ts";
import conferenceLecture from "./_test/nva_conference_lecture.json" with {
  type: "json",
};
Deno.test("NVA", async (t) => {
  await t.step("Conference Lecture", async () => {
    const actual = await pubFromNva(conferenceLecture);
    const expected = {
      id:
        "https://api.test.nva.aws.unit.no/publication/01907a95b7e5-0a61bd8c-cdde-4b31-b27a-1da198da19b9",
      parent: undefined,
      doi: undefined,
      nva: "01907a95b7e5-0a61bd8c-cdde-4b31-b27a-1da198da19b9",
      url: undefined,
      title: "Arctic zooplankton in changing marine lightscape",
      type: "ConferenceLecture",
      published: "2024-02-08",
      container: "IBI seminar series",
      authors: [{ name: "Martta Viljanen" }, {
        name: "Sanna Kristiina Majaneva",
      }],
      contributors: undefined,
      created: new Date("2024-07-03T21:52:30.693Z"),
      modified: new Date("2024-08-29T18:09:49.167Z"),
      projects: [
        {
          cristin: 2559966,
          name: undefined,
          type: "ResearchProject",
        },
      ],
    };
    assertEquals(actual, expected);
  });
});
