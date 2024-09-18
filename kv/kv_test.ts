import { assertEquals } from "@std/assert";
import { kv } from "./kv.ts";

Deno.test("KV", async (t) => {
  const id = "10.1000/suffix";
  const key = ["pub", id];
  const value = { id };

  await t.step("test using :memory:", () => {
    assertEquals(Deno.env.get("DENO_KV_PATH"), ":memory:");
  });

  await t.step("set/get", async () => {
    await kv.set(key, value);
    const entry = await kv.get(key);
    assertEquals(entry.key, key);
    assertEquals(entry.value, value);
  });
});
