import { assertEquals } from "@std/assert";
import { base64Authorization } from "./auth_request.ts";

const id = "ID";
const secret = "SECRET";
const expected = "SUQ6U0VDUkVU"; // encodeBase64Url("ID:SECRET")

Deno.test("base64AuthToken", () =>
  assertEquals(base64Authorization(id, secret), expected));
