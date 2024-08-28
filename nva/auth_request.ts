import { encodeBase64Url } from "@std/encoding/base64url";

export const base64Authorization = (
  id: string,
  secret: string,
) => encodeBase64Url(id + ":" + secret);

export const buildAccessTokenRequest = (
  { id, secret, url }: { id: string; secret: string; url: URL | string },
) => {
  const method = "POST";
  const token = base64Authorization(id, secret);
  const headers = {
    authorization: `Basic ${token}`,
    "content-type": "application/x-www-form-urlencoded",
  };
  const body = new URLSearchParams();
  body.append("grant_type", "client_credentials");
  return new Request(url, { method, body, headers });
};
