import { doiName, doiUrlString, isDoiUrl } from "../doi/url.ts";
import { handleUrlString, isHandle, isHandleUrl } from "./handle.ts";
import { getChannel } from "../nva/channel.ts";
import type {
  NvaContributor,
  NvaEntityDescription,
  NvaPublication,
  NvaPublicationContext,
  NvaTime,
} from "../nva/types.ts";

import { Pub } from "./types.ts";
import { getNva, getNvaPublication, isNvaUrl } from "../nva/api.ts";
import { Akvaplanist } from "../akvaplanists/types.ts";
import { getFamilyGivenOfCristinPerson } from "../nva/cristin_person.ts";
import { ndjson } from "../util/ndjson.ts";

export const pubFromNva = async (nva: NvaPublication) => {
  const {
    entityDescription,
    publishedDate,
    modifiedDate,
    associatedArtifacts,
  } = nva;

  const { reference } = entityDescription;

  const link = associatedArtifacts?.find(({ type }) =>
    "AssociatedLink" === type
  );
  const url = link ? String(link.id) : undefined;

  const doiNorm = url && isDoiUrl(url) ? doiName(url) : undefined;

  const id = url && isDoiUrl(url) ? doiUrlString(url) : extractId(nva);

  const title = extractTitle({ entityDescription });

  const type = typeFromNvaType(extractNvaType(nva));

  const authors = await extractAuthors(entityDescription.contributors) ?? [];
  const _contributors = await extractContributors(
    entityDescription.contributors,
  );
  const contributors = _contributors?.length > 0 ? _contributors : undefined;
  const { publicationContext } = reference; //publicationIn

  const container = await extractOrFetchContainer(publicationContext);

  const { publicationDate: { year, month, day } } = entityDescription;

  const _parent = "id" in publicationContext
    ? publicationContext.id
    : undefined;

  const parentInNva = isNvaUrl(_parent) &&
      new URL(_parent as string).pathname.startsWith("/publication/")
    ? await getNva<NvaPublication>(_parent as string)
    : undefined;

  const parent = parentInNva ? extractId(parentInNva) : undefined;
  const published = isEvent(nva)
    ? extractEventTime(publicationContext) ??
      extractPublished({ year, month, day })
    : extractPublished({ year, month, day });
  const created = new Date(publishedDate);
  const modified = new Date(modifiedDate);

  const projects = nva?.projects?.length > 0
    ? nva?.projects.map(({ id, name, type }) => ({
      cristin: Number(id.split("/").at(-1)),
      name,
      type,
    }))
    : undefined;

  const pub = {
    id,
    parent,
    doi: doiNorm,
    nva: nva.id.split("/").at(-1),
    url,
    title,
    type,
    published,
    container,
    authors,
    contributors,
    projects,
    created,
    modified,
  } satisfies Pub;

  const { abstract, description } = entityDescription;
  const pubWithAbstract = JSON.stringify(pub).length + abstract?.length;
  if (abstract && pubWithAbstract < 65000) {
    pub.abstract = abstract;
  }
  // if (description) {
  //   state.value.description = description;
  // }
  return pub;
};

const authorTypes = new Set(["Creator", "Journalist"]);

const extractAnthologyContainer = (
  entityDescription: NvaEntityDescription,
) => entityDescription?.mainTitle;

const extractAuthors = async (
  contributors: NvaContributor[],
) =>
  await Array.fromAsync(
    structuredClone(contributors)
      ?.filter(({ role: { type } }) => authorTypes.has(type))
      .map(async (
        { identity: { name, id } },
      ) => {
        const m = /cristin\/person\/(?<cristin>[0-9]+)$/.exec(id);
        if (m) {
          const id = Number(m.groups.cristin);
          const names = await getFamilyGivenOfCristinPerson(id);
          if (names && "family" in names && "given" in names) {
            const { family, given } = names;
            return { family, given };
          } else {
            return { name };
          }
        } else {
          return { name };
        }
      }),
  );

const extractContributors = (contributors: NvaContributor[]) =>
  structuredClone(contributors)
    ?.filter(({ role: { type } }) => !authorTypes.has(type))
    .map((
      { identity: { name } },
    ) => ({ name }));

const extractEventTime = (ctx: NvaPublicationContext) => {
  if ("time" in ctx) {
    const { from, to }: NvaTime = ctx.time;
    if (from && to && from !== to) {
      return [from, to].join("/").replaceAll("T00:00:00Z", "");
    }
    if (from) {
      return from.replace("T00:00:00Z", "");
    }
    if (to) {
      return to.replace("T00:00:00Z", "");
    }
  }
};

const extractOrFetchContainer = async (
  publicationContext: NvaPublicationContext,
) => {
  const {
    label,
    series,
    type,
    id,
    disseminationChannel,
    entityDescription,
    publisher,
  } = publicationContext;

  if (label) {
    return label;
  }

  if (["Anthology"].includes(type as string)) {
    if (id && !entityDescription) {
      const parent = await getNva(id) as NvaPublication;
      if (parent) {
        return extractTitle(parent);
      }
    }
    if (entityDescription) {
      return extractAnthologyContainer(entityDescription);
    }
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
  if (publisher) {
    const { name, id } = publisher;
    if (name) {
      return name;
    } else if (id) {
      const publ = await getChannel(id);
      if (publ) {
        return publ.name;
      }
    }
  }

  return "";
};

export const extractId = (
  { id, handle, entityDescription, additionalIdentifiers }: NvaPublication,
) => {
  const { reference } = entityDescription ?? {};
  const { doi } = reference ?? {};

  const hdl = handle ??
    additionalIdentifiers?.find(({ type }) => type === "HandleIdentifier")
      ?.value;

  return doi && isDoiUrl(doi)
    ? doiUrlString(doi)
    : hdl && (isHandleUrl(hdl) || isHandle(hdl as string))
    ? handleUrlString(hdl)
    : nvaUrlString(id);
};

const extractTitle = (
  { entityDescription }: Pick<NvaPublication, "entityDescription">,
) =>
  entityDescription.mainTitle
    .replace(/[\r\n]/g, " ")
    .replace(/[\s]{2,}/g, " ")
    .trim();

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

export const extractNvaType = (
  nva: NvaPublication,
) => {
  const {
    entityDescription: {
      reference: {
        publicationInstance,
        publicationContext: { type },
      },
    },
  } = nva;
  if ("type" in publicationInstance) {
    return publicationInstance.type;
  }
  return type instanceof Array ? type.sort().join("/") : type;
};

const isEvent = (nva: NvaPublication) =>
  ["ConferencePoster", "ConferenceLecture", "Lecture"].includes(
    extractNvaType(nva),
  );

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

const typeFromNvaType = (nvapubtype: string) => {
  switch (nvapubtype) {
    default:
      return nvapubtype;
  }
};

import { insertPub, updatePub } from "./pub.ts";
import { kv } from "../kv/kv.ts";

if (import.meta.main) {
  const [id, action] = Deno.args;
  if (id) {
    // NDJSON of pub after transform
    const nva = await getNvaPublication({ id });
    const pub = await pubFromNva(nva);
    ndjson(pub);

    // INSERT or UPDATE publication from NVA
    // Useful eg. when DOI metadata is missing
    // $ deno run --env-file --allow-env --allow-net pub/pub_from_nva.ts 0193960f2c7c-0ca81b11-57cf-48c2-9fb0-d7fdf0b783a1 insert
    const nvakey = ["nva", nva.identifier];
    switch (action) {
      case "insert":
        await kv.set(nvakey, nva);
        console.warn(await insertPub(pub));
        break;

      case "update":
        await kv.set(nvakey, nva);
        console.warn(await updatePub(pub));
        break;
    }
  }
}
