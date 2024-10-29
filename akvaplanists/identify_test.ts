import { assertEquals } from "@std/assert/equals";
import { identify, prepareSpelling } from "./identify.ts";
import { Akvaplanist } from "./types.ts";

const per: Akvaplanist = {
  id: "per",
  family: "Renaud",
  given: "Paul E.",
  spelling: {
    id: "per",
    fn: new Set(),
    gn: new Set([
      "Paul E.",
      "PAUL E.",
      "Paul E",
      "P. E.",
      "P.E.",
      "Paul",
      "PE",
      "P.",
      "P",
    ]),
  },
};
const jb: Akvaplanist = {
  "id": "01hs99np0he7pp7mf469qtavpg",
  "family": "Berge",
  "given": "Jørgen",
  "prior": true,
  spelling: {
    id: "01hs99np0he7pp7mf469qtavpg",
    fn: new Set(),
    "gn": new Set(["Jørgen", "Berge", "JÃ¸rgen", "JØRGEN", "J.", "J"]),
  },
};

Deno.test("identify", async (t) => {
  const spellings = new Map([
    ["per", prepareSpelling(per)],
    ["01hs99np0he7pp7mf469qtavpg", prepareSpelling(jb)],
  ]);

  await t.step("name known: { family, given, id }", async () => {
    assertEquals(await identify({ name: "Paul Eric Renaud" }, spellings), {
      family: "Renaud",
      given: "Paul E.",
      id: "per",
      orcid: undefined,
      prior: undefined,
      openalex: undefined,
    });
  });

  await t.step("name unknown: undefined", async () => {
    assertEquals(
      await identify({ name: "Jasmine Magali Nahrgang-Berge" }, spellings),
      undefined,
    );
  });
});
