import { authBase, base } from "./defaults.ts";

export const ignoreTypes = [
  // "Lecture",
  // "ConferenceLecture",
  // "ConferencePoster",
  // "PopularScienceArticle",
  // "MediaInterview",
  // "MediaFeatureArticle",
];

export const getNvaConfigFromEnv = () => ({
  base: new URL(Deno.env.get("NVA_BASE") ?? base),
  id: Deno.env.get("NVA_CLIENT_ID") ?? "",
  secret: Deno.env.get("NVA_CLIENT_SECRET") ?? "",
  authTokenUrl: new URL(
    "/oauth2/token",
    Deno.env.get("NVA_TOKEN_URL") ??
      authBase,
  ),
});
