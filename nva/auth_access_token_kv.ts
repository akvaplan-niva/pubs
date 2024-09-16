#!/usr/bin/env -S deno run --env-file --allow-env --allow-net
import { buildAccessTokenRequest } from "./auth_request.ts";
import { decodeAcessTokenResponse } from "./auth_access_token.ts";
import { getNvaConfigFromEnv } from "./config.ts";
import { kv } from "../kv/kv.ts";

import type { AccessTokenObject, AccessTokenResponse } from "./types.ts";

export const getAccessTokenObject = async () => {
  const { id, secret, authTokenUrl } = getNvaConfigFromEnv();

  const tokenInKv =
    (await kv.get<AccessTokenObject>(["nva_access", authTokenUrl.href, id]))
      ?.value;

  if (tokenInKv && tokenInKv.expires > new Date()) {
    return tokenInKv;
  }

  const req = buildAccessTokenRequest({ id, secret, url: authTokenUrl });
  const res = await fetch(req);
  if (!res.ok) {
    console.error(res);
  } else {
    const accessTokenResponse: AccessTokenResponse = await res.json();
    const accessTokenObject = decodeAcessTokenResponse(accessTokenResponse);

    await kv.set(["nva_access", url.href, id], accessTokenObject, {
      expireIn: accessTokenObject.expires_in * 1000,
    });
    return accessTokenObject;
  }
};

export const getToken = async () =>
  (await getAccessTokenObject())?.access_token;

if (import.meta.main) {
  console.log(JSON.stringify(await getAccessTokenObject()));
}
