export const kv = await Deno.openKv(
  Deno.env.has("DENO_KV_PATH") ? Deno.env.get("DENO_KV_PATH") : undefined,
);
export async function* keys<T>(selector: Deno.KvListSelector) {
  for await (const { key } of kv.list<T>(selector)) {
    yield key;
  }
}

export type KeyExtractor<T> = (item: T, pos: number) => Promise<Deno.KvKey>;

export const setManyAtomic = async <T>(
  values: Iterable<T>,
  { key }: { key: KeyExtractor<T> },
) => {
  const atomic = kv.atomic();
  let i = 0;
  for await (const v of values) {
    const k = await key(v, i++);
    atomic.set(k, v);
  }
  return await atomic.commit();
};

export const deleteManyAtomic = async <T>(
  values: Iterable<T>,
  { key }: { key: KeyExtractor<T> },
) => {
  const atomic = kv.atomic();
  let i = 0;
  for await (const v of values) {
    const k = await key(v, i++);
    console.warn("DELETE", k);
    atomic.delete(k);
  }
  return await atomic.commit();
};

export const deleteKeysAtomic = async (
  keys: Deno.KvKey[],
) => {
  const atomic = kv.atomic();
  for await (const key of keys) {
    console.warn("DELETE", key);
    atomic.delete(key);
  }
  return await atomic.commit();
};
