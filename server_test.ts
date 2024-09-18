import { assertEquals } from "@std/assert";
import { kv } from "./kv/kv.ts";
import server from "./server.ts";

const serverFetch = async (path: string) =>
  await server.fetch(new Request(new URL(path, "http://pubs.local")));

// Deno.test("Server", async (t) => {
//   await t.step("GET /pub/:doi", async () => {
//     const res = await serverFetch("/pub/10.1002/2013gl058304");
//     assertEquals(await res.text(), "");
//     assertEquals(
//       res.headers.get("content-type")?.startsWith("application/json"),
//       true,
//     );
//   });
// });

Deno.test("Server errors", async (t) => {
  await t.step("404 Not Found", async () => {
    const res = await serverFetch("/unknown");
    assertEquals(res.status, 404);
    assertEquals(
      res.headers.get("content-type")?.startsWith("text/plain"),
      true,
    );
  });
  await t.step("405 Method Not Allowed", async () => {
    const res = await server.fetch(
      new Request(new URL("http://example.com"), {
        method: "DELETE",
      }),
    );
    assertEquals(res.status, 405);
    assertEquals(
      res.headers.get("content-type")?.startsWith("text/plain"),
      true,
    );
  });
});

// Deno.test(async function crossrefWork() {
//   const res = await serverFetch("/crossref/10.1002/2013gl058304");
//   assertEquals(
//     res.headers.get("content-type")?.startsWith(
//       "application/json",
//     ),
//     true,
//   );
//   const work = await res.json();
//   assertEquals(work.DOI, "10.1002/2013gl058304");
// });
