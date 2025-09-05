import { kv } from "./kv/kv.ts";
import { getCrossrefWorkFromApi } from "./crossref/work.ts";
import { doiName, doiUrlString, isDoiName } from "./doi/url.ts";
import { getOrLookupCrossrefWork } from "./kv/crossref.ts";
import { getPub, getPubAndReidentify } from "./pub/pub.ts";
import { getNvaConfigFromEnv } from "./nva/config.ts";

export const crossrefWork = async (
  _request: Request,
  _info?: Deno.ServeHandlerInfo,
  result?: URLPatternResult | null,
) => {
  const name = pathParam(result, "doi");
  const ref = searchParam(result, "ref") === null
    ? false
    : Boolean(searchParam(result, "ref"));

  const refresh = searchParam(result, "refresh") === null
    ? false
    : Boolean(searchParam(result, "refresh"));

  const work = name
    ? refresh
      ? await getCrossrefWorkFromApi(name)
      : await getOrLookupCrossrefWork(name, { ref })
    : null;
  return work ? Response.json(work) : send404();
};

export const doiPub = async (
  _request: Request,
  _info?: Deno.ServeHandlerInfo,
  result?: URLPatternResult | null,
) => {
  const prefixAfter10Dot = pathParam(result, "prefix");
  const pre = `10.${prefixAfter10Dot}`;
  const suf = pathParam(result, "suffix");
  const id = pre && suf ? doiUrlString(`${pre}/${suf}`) : null;
  return id ? await getAndSendPub(id, result) : send404();
};

export const getAndSendKvEntry = async (key: Deno.KvKey) => {
  const entry = await kv.get(key);
  return entry.versionstamp ? Response.json(entry) : send404();
};

const getAndSendPub = async (
  id: string,
  result?: URLPatternResult | null,
) => {
  const _detect = result && searchParam(result, "identify");
  const detect = _detect && ["1", "true"].includes(_detect) ? true : false;
  const pub = detect ? await getPubAndReidentify(id) : await getPub(id);
  return pub ? Response.json(pub) : send404();
};

export const openalexDoiWork = async (
  _request: Request,
  _info?: Deno.ServeHandlerInfo,
  result?: URLPatternResult | null,
) => {
  const _doi = pathParam(result, "doi") as string;
  const doi = doiUrlString(_doi);
  console.warn({ doi });
  return await getAndSendKvEntry(["openalex_doi", doi]);
};

export const hdlPub = async (
  _request: Request,
  _info?: Deno.ServeHandlerInfo,
  result?: URLPatternResult | null,
) => {
  const pre = pathParam(result, "prefix");
  const suf = pathParam(result, "suffix");
  const id = new URL(`${pre}/${suf}`, "https://hdl.handle.net").href;
  return await getAndSendPub(id, result);
};

export const nvaPub = async (
  _request: Request,
  _info?: Deno.ServeHandlerInfo,
  result?: URLPatternResult | null,
) => {
  const _id = pathParam(result, "id");
  const id = _id ? getNvaId(_id) : null;
  console.warn("nvaPub", id);
  return id ? await getAndSendPub(id, result) : send404();
};

export const pathParam = (
  result: URLPatternResult | null | undefined,
  key: string,
) => result ? result.pathname.groups?.[key] : null;

export const publicationMetadataFromNva = async (
  _request: Request,
  _info?: Deno.ServeHandlerInfo,
  result?: URLPatternResult | null,
) => {
  const id = pathParam(result, "id");
  const nva = await kv.get(["nva", id as string]);
  return nva && nva.versionstamp ? Response.json(nva.value) : send404();
};

export const searchParam = (
  result: URLPatternResult | null | undefined,
  key: string,
) => result ? new URLSearchParams(result.search.input).get(key) : null;
export const sendServerError = (
  status: number,
  text = `Internal Server Error`,
) => new Response(`${status} ${text}`, { status });

export const send404 = () => new Response("404 Not Found", { status: 404 });

export const send405 = () =>
  new Response("405 Method Not Allowed", { status: 405 });

export const readableStreamOfKvListValues = <T>(
  list: Deno.KvListIterator<T>,
) =>
  new ReadableStream({
    async start(controller) {
      let sequence = 0;
      for await (const { key, value, versionstamp } of list) {
        controller.enqueue(
          JSON.stringify({ key, value, versionstamp, sequence }) + "\r\n",
        );
        sequence++;
      }
      controller.close();
    },
  });

export const streamKvListValues = <T>(
  selector: Deno.KvListSelector,
  result?: URLPatternResult | null,
) => {
  const _limit = Number(searchParam(result, "limit"));
  const limit = _limit === -1 ? undefined : _limit > 0 ? _limit : 10;
  return responseWithKvList<T>(kv, selector, {
    reverse: false,
    limit,
  });
};

const getNvaId = (cand: string) => {
  const prod = "https://api.nva.unit.no/publication/";
  const test = "https://api.test.nva.aws.unit.no/publication/";
  if (
    cand.startsWith(prod) ||
    cand.startsWith(test)
  ) {
    return cand;
  }
  if (cand.length === 49) {
    const { base } = getNvaConfigFromEnv();
    return new URL(`/publication/${cand}`, base).href;
  }
};

const textResponse = (rs: ReadableStream) => {
  const body = rs.pipeThrough(new TextEncoderStream());
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf8" },
  });
};

const responseWithKvList = <T>(
  kv: Deno.Kv,
  sel: Deno.KvListSelector,
  opts: Deno.KvListOptions,
) => {
  const rs = readableStreamOfKvListValues(
    kv.list<T>(sel, opts),
  );
  return textResponse(rs);
};
