import { assertEquals } from "jsr:@std/assert";
import app from "./app.ts";

Deno.test("app", () => {
  assertEquals(typeof app, "object");
});