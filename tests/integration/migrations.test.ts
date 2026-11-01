import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startDb, tableNames, type TestDb } from "./setup";

let t: TestDb;

beforeAll(async () => {
  t = await startDb();
});
afterAll(async () => {
  await t.stop();
});

describe("міграції", () => {
  it("створюють таблиці на порожній базі", async () => {
    expect(await tableNames(t.db)).toEqual(["clients", "declarations"]);
  });
});
