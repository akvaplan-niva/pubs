import { getSeries } from "../nva/series.ts";
import type {
  NvaContributor,
  NvaEntityDescription,
  NvaPublication,
  NvaPublicationContext,
} from "../nva/types.ts";
import { Pub } from "./types.ts";

export const pubFromNva = async (nva: NvaPublication) => {
  const {
    entityDescription,
    createdDate,
    publishedDate,
    modifiedDate,
    //associatedArtifacts,
  } = nva;

  const { mainTitle, reference } = entityDescription;
  const { doi } = reference;
  const id = doi ? doi : nva.handle ? handleUrlString(nva.handle) : nva.id;

  const title = mainTitle
    .replace(/[\r\n]/g, " ")
    .replace(/[\s]{2,}/g, " ")
    .trim();

  const type = typeFromNvaType(extractNvaType(nva));
  const authors = extractAuthors(entityDescription.contributors);
  const { publicationContext } = reference;
  const container = await extractOrFetchContainer(publicationContext);

  const { publicationDate: { year } } = entityDescription;

  const published = year ? year : new Date(publishedDate).toJSON();
  const created = new Date(createdDate);
  const modified = new Date(modifiedDate);

  const pub: Pub = {
    id,
    nva: nva.id,
    title,
    type,
    published,
    container,
    authors,
    created,
    modified,
  };
  return pub;
};

// FIXME => extractAuthors must check contributor role…
const extractAuthors = (contributors: NvaContributor[]) =>
  contributors.map(({ identity: { name } }) => ({ name }));

// const extractContributors = (contributors: NvaContributor[]) =>
//   contributors.map(({ identity: { name } }) => ({ name }));

const extractAnthology = (
  entityDescription: NvaEntityDescription,
) => entityDescription.mainTitle;

const extractOrFetchContainer = async (
  publicationContext: NvaPublicationContext,
) => {
  const { series, type } = publicationContext;
  if (["Anthology"].includes(type as string)) {
    return await extractAnthology(publicationContext.entityDescription);
  }

  if (series) {
    const { name, id } = series;
    if (name) {
      return name;
    }
    if (id) {
      try {
        const series = await getSeries(id);
        if (series) {
          const { name } = series;
          return name;
        }
      } catch (e) {
        console.warn("WARN", e);
      }
    }
  }
};

const handleUrlString = (h: string | URL) =>
  new URL(new URL(h).pathname, "https://hdl.handle.net").href;

//@todo extractPdfs: There seems to be no permanent URLs for public files in NVA

// const extractPublishedFiles = (artifacts: NvaFile[]) =>
//   artifacts.filter(({ type, visibleForNonOwner }) =>
//     visibleForNonOwner === true && type === "PublishedFile"
//   );

// const extractPdfs = (artifacts: NvaFile[]) =>
//   extractPublishedFiles(artifacts)
//     .filter(({ mimeType }) => mimeType === "application/pdf");
// const pdfs = associatedArtifacts ? extractPdfs(associatedArtifacts) : [];
// const pdf = pdfs ? pdfs.at(0)?.name : undefined;

const extractNvaType = (
  nva: NvaPublication,
) => {
  const { entityDescription: { reference: { publicationContext: { type } } } } =
    nva;
  return type instanceof Array ? type.sort().join("/") : type;
};

const typeFromNvaType = (nvapubtype: string) => {
  switch (nvapubtype) {
    case "anthology":
      return "book-chapter";
    default:
      return nvapubtype.toLowerCase();
  }
};
