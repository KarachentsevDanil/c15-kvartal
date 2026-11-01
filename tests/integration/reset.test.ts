import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { resetDatabase } from "../../src/store/reset";
import { clients } from "../../src/store/schema";
import { startDb, tableNames, type TestDb } from "./setup";

let t: TestDb;

beforeAll(async () => {
  t = await startDb();
});
afterAll(async () => {
  await t.stop();
});

describe("resetDatabase", () => {
  it("прибирає дані й заново застосовує всі міграції", async () => {
    await t.db.insert(clients).values({ taxNumber: "9000000001", fullName: "Тест Клієнт", email: "c1@example.com" });
    const before = await t.db.execute(sql`select count(*)::int as count from drizzle.__drizzle_migrations`);

    await resetDatabase(t.db);

    const after = await t.db.execute(sql`select count(*)::int as count from drizzle.__drizzle_migrations`);
    expect(await t.db.select().from(clients)).toEqual([]);
    expect(await tableNames(t.db)).toEqual(["clients", "declarations", "filing_attempts"]);
    expect(after.rows).toEqual(before.rows);
  });
});
