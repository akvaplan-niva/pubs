import { doiName, isDoiUrl } from "../doi/url.ts";
import { handleUrlString, isHandle, isHandleUrl } from "./handle.ts";
import { getChannel } from "../nva/channel.ts";
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
    publishedDate,
    modifiedDate,
    associatedArtifacts,
    additionalIdentifiers,
  } = nva;

  const { mainTitle, reference } = entityDescription;
  const { doi } = reference;

  const handle = nva.handle ??
    additionalIdentifiers?.find(({ type }) => type === "HandleIdentifier")
      ?.value;

  const id = doi && isDoiUrl(doi)
    ? doi
    : handle && (isHandleUrl(handle) || isHandle(handle))
    ? handleUrlString(handle)
    : nvaUrlString(nva.id);

  const title = mainTitle
    .replace(/[\r\n]/g, " ")
    .replace(/[\s]{2,}/g, " ")
    .trim();

  const type = typeFromNvaType(extractNvaType(nva));

  const authors = extractAuthors(entityDescription.contributors) ?? [];
  const contributors = extractContributors(entityDescription.contributors);
  const { publicationContext } = reference;
  const container = await extractOrFetchContainer(publicationContext);

  const { publicationDate: { year, month, day } } = entityDescription;

  const published = extractPublished({ year, month, day });
  const created = new Date(publishedDate);
  const modified = new Date(modifiedDate);

  const link = associatedArtifacts?.find(({ type }) =>
    "AssociatedLink" === type
  );
  const url = link ? String(link.id) : undefined;

  return {
    id,
    doi: doi ? doiName(doi) : undefined,
    nva: nva.id.split("/").at(-1),
    url,
    title,
    type,
    published,
    container,
    authors,
    contributors,
    created,
    modified,
  } satisfies Pub;
};

const authorTypes = new Set(["Creator", "Journalist"]);

const extractAuthors = (contributors: NvaContributor[]) =>
  structuredClone(contributors)
    .filter(({ role: { type } }) => authorTypes.has(type))
    .map((
      { identity: { name } },
    ) => ({ name }));

const extractContributors = (contributors: NvaContributor[]) =>
  structuredClone(contributors)
    .filter(({ role: { type } }) => !authorTypes.has(type))
    .map((
      { identity: { name } },
    ) => ({ name }));

const extractAnthology = (
  entityDescription: NvaEntityDescription,
) => entityDescription?.mainTitle;

const extractOrFetchContainer = async (
  publicationContext: NvaPublicationContext,
) => {
  const { series, type, id, disseminationChannel } = publicationContext;

  if (["Anthology"].includes(type as string)) {
    return await extractAnthology(publicationContext.entityDescription);
  }

  if (disseminationChannel) {
    return disseminationChannel;
  } else if (id && !series) {
    const channel = await getChannel(id);
    if (channel) {
      return channel.name;
    }
  } else if (series) {
    const { name, id } = series;
    if (name) {
      return name;
    }
    if (id) {
      try {
        const series = await getChannel(id);
        if (series) {
          return series.name;
        }
      } catch (e) {
        console.warn("WARN", e);
      }
    }
  }
  return "";
};

const extractPublished = (
  { year, month, day }: {
    year: string | number;
    month?: string | number;
    day?: string | number;
  },
) => {
  if (year && month && day) {
    return new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0, 0)
      .toJSON().substring(0, 10);
  }
  if (year && month) {
    return `${year}-${month}`;
  }
  return String(year);
};

const nvaUrlString = (id: string | URL) =>
  new URL(id, "https://nva.sikt.no/registration/").href;

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
    // case "anthology":
    //   return "book-chapter";
    default:
      return nvapubtype.toLowerCase();
  }
};
