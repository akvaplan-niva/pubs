import { assertEquals } from "@std/assert";
import { pubFromNva } from "./pub_from_nva.ts";
import { Pub } from "./types.ts";
import { NvaPublication } from "../nva/types.ts";

Deno.test("NVA", async (t) => {
  await t.step("Report", async () => {
    const report = JSON.parse(
      `{"type":"Publication","identifier":"01907a96b6e6-832117b6-3f8a-4a5a-9e0c-846a7fce9285","status":"PUBLISHED","resourceOwner":{"owner":"niva@7464.0.0.0","ownerAffiliation":"https://api.test.nva.aws.unit.no/cristin/organization/7464.0.0.0"},"publisher":{"type":"Organization","id":"https://api.test.nva.aws.unit.no/customer/0baf8fcb-b18d-4c09-88bb-956b4f659103"},"createdDate":"2024-07-03T21:53:35.974841675Z","modifiedDate":"2024-08-29T18:46:05.094932419Z","publishedDate":"2024-07-03T21:53:35.974841675Z","handle":"https://hdl.handle.net/11250/3034605","entityDescription":{"type":"EntityDescription","mainTitle":"Episoder med skadelige alger og maneter i oppdrett- hva kan vi lære av erfaringer fra merdkanten","alternativeTitles":{},"language":"http://lexvo.org/id/iso639-3/nob","publicationDate":{"type":"PublicationDate","year":"2022"},"contributors":[{"type":"Contributor","identity":{"type":"Identity","id":"https://api.test.nva.aws.unit.no/cristin/person/417947","name":"Trine Dale","verificationStatus":"Verified","additionalIdentifiers":[]},"affiliations":[{"type":"Organization","id":"https://api.test.nva.aws.unit.no/cristin/organization/7464.20.15.0"}],"role":{"type":"Creator"},"sequence":1,"correspondingAuthor":false},{"type":"Contributor","identity":{"type":"Identity","id":"https://api.test.nva.aws.unit.no/cristin/person/57500","name":"Trude Kristin Borch","verificationStatus":"Verified","additionalIdentifiers":[]},"affiliations":[],"role":{"type":"Creator"},"sequence":2,"correspondingAuthor":false},{"type":"Contributor","identity":{"type":"Identity","id":"https://api.test.nva.aws.unit.no/cristin/person/1408184","name":"Gjermund Bahr","verificationStatus":"Verified","additionalIdentifiers":[]},"affiliations":[{"type":"Organization","id":"https://api.test.nva.aws.unit.no/cristin/organization/6064.0.0.0"}],"role":{"type":"Creator"},"sequence":3,"correspondingAuthor":false},{"type":"Contributor","identity":{"type":"Identity","name":"Patricio Feest","verificationStatus":"NotVerified","additionalIdentifiers":[]},"affiliations":[],"role":{"type":"Creator"},"sequence":4,"correspondingAuthor":false},{"type":"Contributor","identity":{"type":"Identity","name":"Fernanda Cisterna","verificationStatus":"NotVerified","additionalIdentifiers":[]},"affiliations":[],"role":{"type":"Creator"},"sequence":5,"correspondingAuthor":false}],"alternativeAbstracts":{},"tags":["Algeoppblomstring","Algal blooms","Lakseoppdrett","Salmon breeding","Dødelighet","Mortality","Manetoppblomstring","Jellyfish bloom","Manetblomstring"],"description":"Prosjektleder Trine Dale","reference":{"type":"Reference","publicationContext":{"type":"Report","series":{"type":"Series","id":"https://api.test.nva.aws.unit.no/publication-channels-v2/series/F88E7DA3-53C9-42F5-8751-BC95F74A0D57/2022"},"seriesNumber":"Issue:7755-2022","publisher":{"type":"Publisher","id":"https://api.test.nva.aws.unit.no/publication-channels-v2/publisher/41E4DA94-1E8C-4838-8E92-11689CFE3913/2022","valid":true},"isbnList":[],"additionalIdentifiers":[]},"publicationInstance":{"type":"ReportResearch","pages":{"type":"MonographPages","pages":"27","illustrated":false}}},"abstract":"Noen ganger forårsaker oppblomstringer av alger og maneter skadelig for akvakulturvirksomhet og forårsaker fiskedød og redusert fiskevelferd. Et ferskt eksempel er oppblomstringen av Chrysochromulia leadbeateri i 2019 som forårsaket massiv fiskedød og store tap for de oppdretterne som ble berørt. Det er en bekymring for at havbruksnæringen vil oppleve økte problemer med skadelige alger og maneter i fremtiden grunnet klimaendringer. Et steg på veien mot et system som kan bidra til å forebygge og håndtere episoder med skadelige alger og maneter er å sammenstille eksisterende kunnskap, både den som finnes i forsknings- og teknologimiljøene og den som næringen selv besitter. I dette prosjektet har vi samlet vitenskapelig og erfaringsbasert kunnskap om hvordan skader grunnet alger og maneter kan forebygges og håndteres, og laget en prototype på et brukervennlig verktøy som tilgjengeliggjør dette kunnskapsgrunnlaget. Vi har innhentet erfaringsbasert kunnskap gjennom dybdeintervjuer med oppdrettere og fiskehelsepersonell fra Norge, Chile, Canada og UK. Her rapporteres resultatene fra disse intervjuene herunder respondentenes beskrivelser av hvordan episoder med skadelige alge og manetoppblomstringer arter seg, deres erfaringer med ulike avbøtende tiltak og hvordan disse har virket, tanker omkring hvordan man kan bygge beredskap for fremtiden."},"projects":[],"fundings":[],"subjects":[],"associatedArtifacts":[{"type":"PublishedFile","identifier":"5f3d5fdd-09fb-4f8e-9890-a07395894c2b","name":"7755-2022.pdf","mimeType":"application/pdf","size":3471803,"license":"https://rightsstatements.org/page/inc/1.0","administrativeAgreement":false,"publisherVersion":"PublishedVersion","rightsRetentionStrategy":{"type":"NullRightsRetentionStrategy","configuredType":"Unknown"},"publishedDate":"2024-07-19T11:39:08.884408760Z","uploadDetails":{"source":"Brage","archive":"niva","uploadedDate":"2024-07-19T11:39:08.675697032Z","type":"ImportUploadDetails"},"visibleForNonOwner":true},{"type":"UnpublishableFile","identifier":"f8af15d4-34c3-484c-a429-b0fada16efae","name":"dublin_core.xml","mimeType":"application/xml","size":8256,"administrativeAgreement":true,"uploadDetails":{"source":"Brage","archive":"niva","uploadedDate":"2024-07-19T11:39:08.675737713Z","type":"ImportUploadDetails"},"visibleForNonOwner":false,"rightsRetentionStrategy":{"type":"NullRightsRetentionStrategy","configuredType":"Unknown"}}],"importDetails":[{"type":"ImportDetail","importDate":"2024-07-03T21:53:35.974841675Z","importSource":{"type":"ImportSource","source":"CRISTIN"}},{"type":"ImportDetail","importDate":"2024-07-19T11:39:09.106019977Z","importSource":{"type":"ImportSource","source":"BRAGE","archive":"niva"}}],"additionalIdentifiers":[{"type":"AdditionalIdentifier","sourceName":"Cristin","value":"2080458"},{"type":"AdditionalIdentifier","sourceName":"handle","value":"https://hdl.handle.net/11250/3034605"}],"rightsHolder":"© Norsk institutt for vannforskning. Publikasjonen kan siteres fritt med kildeangivelse.","allowedOperations":[],"publicationNotes":[],"@context":{"@vocab":"https://nva.sikt.no/ontology/publication#","xsd":"http://www.w3.org/2001/XMLSchema#","id":"@id","type":"@type","affiliations":{"@id":"affiliation","@container":"@set"},"activeFrom":{"@type":"xsd:dateTime"},"activeTo":{"@type":"xsd:dateTime"},"associatedArtifacts":{"@id":"associatedArtifact","@container":"@set"},"additionalIdentifiers":{"@id":"additionalIdentifier","@container":"@set"},"publicationNotes":{"@id":"publicationNote","@container":"@set"},"alternativeTitles":{"@id":"alternativeTitle","@container":"@language"},"approvals":{"@id":"approval","@container":"@set"},"approvalStatus":{"@type":"@vocab","@context":{"@vocab":"https://nva.sikt.no/ontology/publication#"}},"approvedBy":{"@type":"@vocab","@context":{"@vocab":"https://nva.sikt.no/ontology/approvals-body#"}},"architectureOutput":{"@id":"architectureOutput","@container":"@set"},"compliesWith":{"@id":"compliesWith","@container":"@set"},"concertProgramme":{"@id":"concertProgramme","@container":"@set"},"contributors":{"@id":"contributor","@container":"@set"},"createdDate":{"@type":"xsd:dateTime"},"date":{"@type":"xsd:dateTime"},"doi":{"@type":"@id"},"duplicateOf":{"@type":"@id"},"embargoDate":{"@type":"xsd:dateTime"},"from":{"@type":"xsd:dateTime"},"handle":{"@type":"@id"},"indexedDate":{"@type":"xsd:dateTime"},"isbnList":{"@id":"isbn","@container":"@set"},"labels":{"@id":"label","@container":"@language"},"language":{"@type":"@id"},"link":{"@type":"@id"},"manifestations":{"@id":"manifestation","@container":"@set"},"metadataSource":{"@type":"@id"},"modifiedDate":{"@type":"xsd:dateTime"},"musicalWorks":{"@id":"musicalWork","@container":"@set"},"ownerAffiliation":{"@type":"@id"},"outputs":{"@id":"output","@container":"@set"},"publishedDate":{"@type":"xsd:dateTime"},"nameType":{"@type":"@vocab","@context":{"@vocab":"https://nva.sikt.no/ontology/publication#"}},"projects":{"@id":"project","@container":"@set"},"fundings":{"@id":"funding","@container":"@set"},"related":{"@id":"related","@container":"@set"},"referencedBy":{"@id":"referencedBy","@container":"@set"},"role":{"@type":"@vocab","@context":{"@vocab":"https://nva.sikt.no/ontology/publication#"}},"source":{"@type":"@id"},"status":{"@type":"@vocab","@context":{"@vocab":"https://nva.sikt.no/ontology/publication#"}},"subjects":{"@id":"subject","@type":"@id","@container":"@set"},"tags":{"@id":"tag","@container":"@set"},"to":{"@type":"xsd:dateTime"},"trackList":{"@id":"trackList","@container":"@set"},"venues":{"@id":"venue","@container":"@set"},"curatingInstitutions":{"@id":"curatingInstitution","@type":"@id","@container":"@set"},"contributorOrganizations":{"@id":"contributorOrganization","@container":"@set","@type":"@id"},"importDetails":{"@id":"importDetail","@container":"@set"}},"id":"https://api.test.nva.aws.unit.no/publication/01907a96b6e6-832117b6-3f8a-4a5a-9e0c-846a7fce9285"}`,
    ) as NvaPublication;

    // Add series name to skip remote fetch during test
    report.entityDescription.reference.publicationContext.series!.name =
      "NIVA_REPORT_NAME";

    const expect: Pub = {
      id: "https://hdl.handle.net/11250/3034605",
      nva: "01907a96b6e6-832117b6-3f8a-4a5a-9e0c-846a7fce9285",
      title:
        "Episoder med skadelige alger og maneter i oppdrett- hva kan vi lære av erfaringer fra merdkanten",
      type: "ReportResearch",
      authors: [
        { "name": "Trine Dale" },
        { "name": "Trude Kristin Borch" },
        { "name": "Gjermund Bahr" },
        { "name": "Patricio Feest" },
        { "name": "Fernanda Cisterna" },
      ],
      container: "NIVA_REPORT_NAME",
      created: new Date("2024-07-03T21:53:35.974Z"),
      modified: new Date("2024-08-29T18:46:05.094Z"),
      published: "2022",
      doi: undefined,
      url: undefined,
      contributors: undefined,
      parent: undefined,
      projects: undefined,
    };
    // @ts-ignore FIXME
    assertEquals(await pubFromNva(report), expect);
  });
  // await t.step("With DOI", async () => {
  //   assertEquals(await pubFromNva({}), {});
  // });
});
