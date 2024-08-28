#!/usr/bin/env -S deno run --unstable-kv --env-file --allow-env="NVA_TOKEN_URL,NVA_CLIENT_ID,NVA_CLIENT_SECRET" --allow-net
import { buildAccessTokenRequest } from "./auth_request.ts";
import { decodeAcessTokenResponse } from "./auth_access_token.ts";
import { getNvaOAuthEnv } from "./config.ts";
import { kv } from "../kv/kv.ts";

import type { AccessTokenObject, AccessTokenResponse } from "./types.ts";

export const getAccessTokenObject = async () => {
  const { id, secret, url } = getNvaOAuthEnv();

  const tokenInKv =
    (await kv.get<AccessTokenObject>(["nva_access", url.href, id]))
      ?.value;

  if (tokenInKv && tokenInKv.expires > new Date()) {
    return tokenInKv;
  }

  const req = buildAccessTokenRequest({ id, secret, url });
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
