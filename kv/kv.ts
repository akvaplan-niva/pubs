export const kv = await Deno.openKv(
  Deno.env.has("DENO_KV_PATH") ? Deno.env.get("DENO_KV_PATH") : undefined,
);
export async function* keys<T>(selector: Deno.KvListSelector) {
  for await (const { key } of kv.list<T>(selector)) {
    yield key;
  }
}
