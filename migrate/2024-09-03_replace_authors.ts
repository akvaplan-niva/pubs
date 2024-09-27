#!/usr/bin/env -S deno run --env-file --allow-env --allow-net
import { getPub, updatePub } from "../pub/pub.ts";
import type { Pub } from "../pub/types.ts";

const authorReplacements: Pick<Pub, "id" | "authors">[] = [
  {
    "id": "https://doi.org/10.1046/j.1439-0426.2001.00315.x",
    "authors": [
      // T. F. Fernandes1, A. Eleftheriou2, H. Ackefors3, M. Eleftheriou2,
      // A. Ervik4, A. Sanchez-Mata5, T. Scanlon6,P. White7, S. Cochrane7,
      // T. H. Pearson7,8 and P. A. Read1
      // 7=Akvaplan-niva
      { family: "Fernandes", given: "T. F." },
      { family: "Eleftheriou", given: "A." },
      { family: "Ackefors", given: "H." },
      { family: "Eleftheriou", given: "M." },
      { family: "Ervik", given: "A." },
      { family: "Sanchez-Mata", given: "A." },
      { family: "Scanlon", given: "T." },
      { family: "White", given: "P." },
      { family: "Cochrane", given: "S." },
      { family: "Pearson", given: "T. H." },
      { family: "Read", given: "P. A." },
    ],
  }, // Below family/given were swapped for at least one author
  {
    id: "https://doi.org/10.1007/s00227-002-0795-8",
    "authors": [
      { given: "K.", family: "Bischof" },
      { given: "D.", family: "Hanelt" },
      { given: "J.", family: "Aguilera" },
      { given: "U.", family: "Karsten" },
      { given: "B.", family: "Vögele" },
      { given: "T.", family: "Sawall" },
      { given: "C.", family: "Wiencke" },
    ],
  },
  {
    "id":
      "https://api.test.nva.aws.unit.no/publication/01907a68bb10-a29c3f3e-ddb9-4ea3-a147-e8001a203bed",
    "authors": [
      { "name": "Lisbeth Håvik" },
      { "name": "Kjetil Våge" },
      { "name": "Benjamin E. Harden" },
      { "name": "Robert S. Pickart" },
      { "name": "Eli Børve" },
      { "name": "Svein Østerhus" },
      { "name": "Laura de Steur" },
      { "name": "Valdimarsson Héðinn" },
      { "name": "Steingrímur Jónsson" },
      { "name": "Andreas Macrander" },
    ],
  },
  {
    "id":
      "https://api.test.nva.aws.unit.no/publication/01907a70c7ec-5c008205-07bb-424b-acce-bf1cac6ab10a",
    "authors": [
      { "name": "Kari Skirbekk" },
      { "name": "Beata Sternal" },
      { "name": "Juho Junttila" },
      { "name": "Kristine Bondo Pedersen" },
      { "name": "Matthias Forwick" },
    ],
  },
  {
    "id":
      "https://api.test.nva.aws.unit.no/publication/01907a920315-3ffbd887-871b-4a8a-be7c-6a22a094c6b1",
    "authors": [
      { "name": "Anders Ruus" },
      { "name": "Ida Beathe Øverjordet" },
      { "name": "Hans Fredrik Veiteberg Braaten" },
      { "name": "Anita Evenset" },
      { "name": "Geir Wing Gabrielsen" },
      { "name": "Katrine Borgå" },
    ],
  },
  {
    "id":
      "https://api.test.nva.aws.unit.no/publication/01907aa6725c-0d727307-b0a2-4c77-9d6a-f66db50850ad",
    "authors": [{ "name": "Anne Cathrine Flyen" }, { "name": "Trude Borch" }, {
      "name": "Hans Jakob Walnum",
    }],
  },
];

export const replaceAuthors = async () => {
  for await (const { id, authors } of authorReplacements) {
    const pub = await getPub(id);
    if (pub) {
      await updatePub({ ...pub, authors });
    }
  }
};

if (import.meta.main) {
  replaceAuthors();
}
