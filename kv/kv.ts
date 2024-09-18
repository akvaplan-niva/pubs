export const kv = await Deno.openKv(
  Deno.env.has("DENO_KV_PATH") ? Deno.env.get("DENO_KV_PATH") : undefined,
);
export async function* keys<T>(selector: Deno.KvListSelector) {
  for await (const { key } of kv.list<T>(selector)) {
    yield key;
  }
}

export const clear = async (selector: Deno.KvListSelector) => {
  let affected = 0;
  //const atomic = kv.atomic();
  for await (const { key } of kv.list(selector)) {
    await kv.delete(key);
    ++affected;
  }

  //const res = await atomic.commit();
  //console.warn({ selector, affected, res });
  //return res;
};

export const deleteMany = async (keys: Iterable<Deno.KvKey>) => {
  let affected = 0;

  const atomic = kv.atomic();
  for (const key of keys) {
    atomic.delete(key);
    ++affected;
  }
  console.warn(await atomic.commit(), { affected });
};
