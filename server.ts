#!/usr/bin/env -S deno serve --env-file --allow-env --allow-read=./data --allow-net=api.crossref.org,akvaplanists.apn.deno.net,api.deno.com,api.cristin.no --watch-hmr --port 7770 

import "./cron.ts";
//import removeText from "./data/remove.txt" with { type: "text" };
import type { Pub } from "./pub/types.ts";
import type { CrossrefWork } from "./crossref/types.ts";
import { type Route, route } from "@std/http";

import {
  crossrefWork,
  doiPub,
  hdlPub,
  nvaPub,
  openalexDoiWork,
  pathParam,
  publicationMetadataFromNva,
  send404,
  send405,
  streamKvListValues,
} from "./server_handlers.ts";

//import { deletePub } from "./pub/pub.ts";
// const removeText = await Deno.readTextFile("./data/remove.txt");
// for (const id of removeText.trim().split("\n")) {
//   const result = await deletePub(id);
//   console.warn({ delete: id, result });
// }

// @ts-expect-error monkey patch Set
Set.prototype.toJSON = function () {
  return [...this];
};

const routes: Route[] = [
  {
    pattern: new URLPattern({ pathname: "/pub" }),
    handler: (_request, _info, result) =>
      streamKvListValues<Pub>({ prefix: ["pub"] }, result),
  },
  {
    pattern: new URLPattern({
      pathname: "/(pub|doi)?(/https\:\/\/doi\.org)?/10\.:prefix/:suffix*",
    }),
    handler: doiPub,
  },
  {
    pattern: new URLPattern({
      pathname:
        "/pub/(hdl|https\:\/\/hdl\.handle\.net)/:prefix([0-9]+)/:suffix([0-9]+)",
    }),
    handler: hdlPub,
  },
  {
    pattern: new URLPattern({
      pathname:
        "/pub(/nva|/https\:\/\/api\.nva\.unit\.no\/publication|/https\:\/\/api\.test\.nva\.aws\.unit\.no\/publication)/:id",
    }),
    handler: nvaPub,
  },
  {
    pattern: new URLPattern({ pathname: "/pub_rel_project_nva" }),
    handler: (_request, _info, result) =>
      streamKvListValues(
        { prefix: ["pub_rel_project_nva"] },
        result,
      ),
  },
  {
    pattern: new URLPattern({ pathname: "/pub_rel_project_nva/:id" }),
    handler: (_request, _info, result) =>
      streamKvListValues(
        { prefix: ["pub_rel_project_nva", Number(pathParam(result, "id"))] },
        result,
      ),
  },
  {
    pattern: new URLPattern({ pathname: "/nva" }),
    handler: (_request, _info, result) =>
      streamKvListValues<Pub>({ prefix: ["nva"] }, result),
  },
  {
    pattern: new URLPattern({
      pathname: "/nva/:id",
    }),
    handler: publicationMetadataFromNva,
  },
  {
    pattern: new URLPattern({ pathname: "/by/:id" }),
    handler: (_request, _info, result) =>
      streamKvListValues(
        { prefix: ["by", pathParam(result, "id") as string] },
        result,
      ),
  },
  {
    pattern: new URLPattern({ pathname: "/crossref" }),
    handler: (_request, _info, result) =>
      streamKvListValues<CrossrefWork>({ prefix: ["crossref"] }, result),
  },
  {
    pattern: new URLPattern({
      pathname: "/crossref(/https\:\/\/doi\.org)?/:doi(10\.*)",
    }),
    handler: crossrefWork,
  },
  {
    pattern: new URLPattern({ pathname: "/openalex" }),
    handler: (_request, _info, result) =>
      streamKvListValues({ prefix: ["openalex_doi"] }, result),
  },
  {
    pattern: new URLPattern({
      pathname: "/openalex(/https\:\/\/doi\.org)?/:doi(10\.*)",
    }),
    handler: openalexDoiWork,
  },
];

export default {
  fetch(request) {
    switch (request.method) {
      case "GET":
      case "HEAD":
        return route(routes, send404)(request);
      case "OPTIONS":
        return new Response("", { status: 200 });
      default:
        return send405();
    }
  },
} satisfies Deno.ServeDefaultExport;
