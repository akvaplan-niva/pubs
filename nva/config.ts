export const getNvaOAuthEnv = () => ({
  id: Deno.env.get("NVA_CLIENT_ID") ?? "",
  secret: Deno.env.get("NVA_CLIENT_SECRET") ?? "",
  url: new URL(
    "/oauth2/token",
    Deno.env.get("NVA_TOKEN_URL") ??
      "https://nva-prod.auth.eu-west-1.amazoncognito.com",
  ),
});
