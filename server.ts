#!/usr/bin/env -S deno serve --env-file --allow-env=DENO_KV_PATH --watch-hmr --port 7666 --allow-net=api.crossref.org
import { kv } from "./kv/kv.ts";
import { getPub } from "./kv/pub.ts";
import { kvListStreamer } from "./kv/stream.ts";
import { getOrLookupCrossrefWork } from "./kv/crossref.ts";
import { decodedDoiUrlString } from "./doi/url.ts";

import { type Route, route } from "@std/http";
import type { Pub } from "./pub/pub_types.ts";
import type { CrossrefWork } from "./crossref/types.ts";

import { refreshDoiPubs } from "./kv/refresh.ts";
Deno.cron("refresh", "13 13 * * *", () => {
  refreshDoiPubs();
});

const send404 = () => new Response("404 Not Found", { status: 404 });

const send405 = () => new Response("405 Method Not Allowed", { status: 405 });

const pathParam = (result: URLPatternResult | null | undefined, key: string) =>
  result ? result.pathname.groups?.[key] : null;

const searchParam = (
  result: URLPatternResult | null | undefined,
  key: string,
) => result ? new URLSearchParams(result.search.input).get(key) : null;

const crossrefWork = async (
  _request: Request,
  _info?: Deno.ServeHandlerInfo,
  result?: URLPatternResult | null,
) => {
  const name = pathParam(result, "doi");
  const ref = searchParam(result, "ref") === null
    ? false
    : Boolean(searchParam(result, "ref"));

  const work = name ? await getOrLookupCrossrefWork(name, { ref }) : null;
  return work ? Response.json(work) : send404();
};

const doiPub = async (
  _request: Request,
  _info?: Deno.ServeHandlerInfo,
  result?: URLPatternResult | null,
) => {
  const name = pathParam(result, "doi");
  const id = name ? decodedDoiUrlString(name) : null;
  const pub = id ? await getPub(id) : null;
  return pub ? Response.json(pub) : send404();
};

const streamKvList = <T>(
  selector: Deno.KvListSelector,
  result?: URLPatternResult | null,
) => {
  const _limit = Number(searchParam(result, "limit"));
  const limit = _limit === -1 ? undefined : _limit > 0 ? _limit : 10;
  return kvListStreamer<T>(kv, selector, {
    reverse: false,
    limit,
  });
};

const routes: Route[] = [
  {
    pattern: new URLPattern({ pathname: "/crossref" }),
    handler: (_request, _info, result) =>
      streamKvList<CrossrefWork>({ prefix: ["crossref"] }, result),
  },
  {
    pattern: new URLPattern({ pathname: "/crossref/:doi(10.*)" }),
    handler: crossrefWork,
  },
  {
    pattern: new URLPattern({ pathname: "/(pub)?" }),
    handler: (_request, _info, result) =>
      streamKvList<Pub>({ prefix: ["pub"] }, result),
  },
  {
    pattern: new URLPattern({
      pathname: "/(pub|doi)?(/https\:\/\/doi\.org)?/:doi(10.*)",
    }),
    handler: doiPub,
  },
  {
    pattern: new URLPattern({
      pathname: "/ping",
    }),
    handler: () => Response.json({ pong: true }),
  },
];

export default {
  fetch(request) {
    switch (request.method) {
      case "GET":
      case "HEAD":
        return route(routes, send404)(request);
      default:
        return send405();
    }
  },
} satisfies Deno.ServeDefaultExport;
