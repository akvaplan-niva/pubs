#!/usr/bin/env -S deno run --env-file --allow-env
import { getNvaConfigFromEnv } from "./config.ts";
import { NvaPublication } from "./types.ts";

const { base } = getNvaConfigFromEnv();
export const buildApiRequest = (
  { url, token, method = "GET", accept = "application/json" }: {
    url: URL | string;
    token?: string;
    accept?: string;
    method?: string;
  },
) => {
  const headers = new Headers({
    accept,
  });
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return new Request(url, {
    headers,
    method,
    credentials: "include",
  });
};

export const getPublication = async (
  { id, token }: { id: string; token?: string },
) => {
  const url = new URL(`/publication/${id}`, base);
  const req = buildApiRequest({ url, token });
  return await fetchNvaJson<NvaPublication>(req);
};

export const downloadPublicFile = async (
  { id, file }: { id: string; file: string },
) => {
  const url = new URL(`/download/public/${id}/files/${file}`, base);
  const req = buildApiRequest({ url });

  const { presignedDownloadUrl } = await fetchNvaJson<
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

const requestFromInput = (inp: Request | URL | string) => {
  if (inp instanceof Request) {
    return inp;
  }
  if (URL.canParse(inp)) {
    return new Request(inp instanceof URL ? inp : new URL(inp));
  }
  return new Request(new URL(inp, base));
};

export const fetchNva = async (inp: Request | URL | string) => {
  const req = requestFromInput(inp);
  const res = await fetch(req);
  if (!res?.ok) {
    console.warn(
      `NVA API GET status ${res.status} for ${res.url}`,
    );
  }
  return res;
};

export const fetchNvaJson = async <T>(inp: Request | URL | string) => {
  const res = await fetchNva(inp);
  return await res.json() as T;
};

const ndjson = (o: unknown) => console.log(JSON.stringify(o));

if (import.meta.main) {
  const [id] = Deno.args;
  if (id) {
    ndjson(await getPublication({ id }));
  }
}
