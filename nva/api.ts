#!/usr/bin/env -S deno run --env-file --allow-env
import { isDoiUrl } from "../doi/url.ts";
import { isHandleUrl } from "../pub/handle.ts";
import { ndjson } from "../util/ndjson.ts";
import { getNvaConfigFromEnv } from "./config.ts";
import { NvaPublication } from "./types.ts";

const { base } = getNvaConfigFromEnv();
export const buildApiRequest = (
  {
    url,
    token,
    method = "GET",
    contentType = "application/json",
    accept = "application/json",
    body,
  }: {
    url: URL | string;
    token?: string;
    contentType?: string;
    accept?: string;
    method?: string;
    body?: undefined | string;
  },
) => {
  const headers = new Headers({
    accept,
  });
  if (body) {
    headers.set("content-type", contentType);
  }
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  url = (url instanceof URL) ? url : new URL(url, base);

  return new Request(url, {
    body,
    headers,
    method,
    credentials: "include",
  });
};

export const buildPublicationUrl = (identifier: string) =>
  new URL(
    identifier,
    new URL("/publication/", base).href,
  );

export const downloadPublicFile = async (
  { id, file }: { id: string; file: string },
) => {
  const url = new URL(`/download/public/${id}/files/${file}`, base);
  const req = buildApiRequest({ url });

  const { presignedDownloadUrl } = await getNva<
    { presignedDownloadUrl: URL }
  >(req);

  const res = await fetch(presignedDownloadUrl);

  if (res && res.body) {
    const filename = JSON.parse(
      (res.headers.get("content-disposition") as string)?.replace(
        "filename=",
        "",
      ),
    );
    const f = await Deno.open(`./${filename}`, {
      write: true,
      create: true,
    });
    return await res.body.pipeTo(f.writable);
  }
};

export const nvaPubUrl = (id: string) =>
  isNvaUrl(id) ? new URL(id) : new URL(`/publication/${id}`, base);

export const getNvaPublication = async (
  { id, token }: { id: string; token?: string },
) => {
  const url = isNvaUrl(id) ? id : new URL(`/publication/${id}`, base);
  const req = buildApiRequest({ url, token });
  return await getNva<NvaPublication>(req);
};

export const searchNvaForId = async (id: string) => {
  const url = new URL(`/search/resources`, base);
  if (isHandleUrl(id)) {
    url.searchParams.set("handle", id);
  } else if (isDoiUrl(id)) {
    url.searchParams.set("doi", id);
  } else {
    throw new RangeError(id);
  }

  const r = await fetch(url);
  if (r?.ok) {
    return await r.json() as { totalHits: number; hits: NvaPublication[] };
  }
};

export const isNvaUrl = (id?: URL | string) =>
  id && URL.canParse(id) &&
  ["api.nva.unit.no", "api.test.nva.aws.unit.no"].includes(
    new URL(id).hostname,
  );

const requestFromInput = (inp: Request | URL | string) => {
  if (inp instanceof Request) {
    return inp;
  }
  if (URL.canParse(inp)) {
    return new Request(inp instanceof URL ? inp : new URL(inp));
  }
  return new Request(new URL(inp, base));
};

export const fetchNva = async (
  inp: Request | URL | string,
  opts?: RequestInit,
) => {
  const req = requestFromInput(inp);
  const res = await fetch(req, opts);
  if (!res?.ok) {
    console.warn(
      `NVA API GET status ${res.status} for ${res.url}`,
    );
  }
  return res;
};

export const getNva = async <T>(inp: Request | URL | string) => {
  const headers = { accept: "application/json" };
  const res = await fetchNva(inp, { headers });
  return await res.json() as T;
};

if (import.meta.main) {
  const [_id] = Deno.args;
  if (_id) {
    const id = isNvaUrl(_id) ? _id : buildPublicationUrl(_id).href;
    ndjson(await getNvaPublication({ id }));
  }
}
