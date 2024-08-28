import type {
  AccessTokenObject,
  AccessTokenPayload,
  AccessTokenResponse,
} from "./types.ts";

import { decodeBase64Url } from "@std/encoding/base64url";

const decodePayload = (payloadBase64: string) =>
  JSON.parse(
    new TextDecoder().decode(decodeBase64Url(payloadBase64)),
  ) as AccessTokenPayload;

export const decodeAcessTokenResponse = (
  accessTokenResponse: AccessTokenResponse,
) => {
  const payloadBase64 = accessTokenResponse.access_token.split(".").at(1) ?? "";
  const payload = decodePayload(payloadBase64);
  const issued = new Date(payload.iat * 1000);
  const expires = new Date(payload.exp * 1000);

  return {
    ...accessTokenResponse,
    issued,
    expires,
  } as AccessTokenObject;
};
