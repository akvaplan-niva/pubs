import { assertEquals } from "@std/assert";
import { pubFromNva } from "./pub_from_nva.ts";
import conferencePoster from "./_test/nva_conference_poster.json" with {
  type: "json",
};

Deno.test("NVA", async (t) =>
  await t.step("Conference Poster", async () => {
    const expect = JSON.parse(
      `{"id":"https://api.test.nva.aws.unit.no/publication/01907a9972ca-697809e8-70b3-480e-aa14-29a1a25ca23c","nva":"01907a9972ca-697809e8-70b3-480e-aa14-29a1a25ca23c","url":"https://api.test.nva.aws.unit.no/publication/01907a9972ca-697809e8-70b3-480e-aa14-29a1a25ca23c","title":"Arctic zooplankton in changing marine lightscape","type":"ConferencePoster","published":"2024-01-29/2024-02-01","container":"Arctic Frontiers 2024 ACTIONS & REACTIONS","authors":[{"family":"Viljanen","given":"Martta"},{"family":"Majaneva","given":"Sanna Kristiina"},{"family":"Majaneva","given":"Markus"},{"family":"Daase","given":"Malin"},{"family":"Johnsen","given":"Geir"},{"name":"Kristian Donner"},{"name":"Magnus Lindström"}],"projects":[{"cristin":2559966,"type":"ResearchProject"}],"created":"2024-07-03T21:56:35.146Z","modified":"2024-08-29T18:06:53.393Z"}`,
    );
    assertEquals(await pubFromNva(conferencePoster), expect);
  }));
