export const kv = await Deno.openKv(
  Deno.env.has("DENO_KV_PATH") ? Deno.env.get("DENO_KV_PATH") : undefined,
);
