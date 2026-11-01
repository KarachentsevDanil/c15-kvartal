import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DrizzleDeclarationsRepo } from "../../src/store/declarations.repo";
import { clients } from "../../src/store/schema";
import { startDb, type TestDb } from "./setup";

let t: TestDb;
let repo: DrizzleDeclarationsRepo;

beforeAll(async () => {
  t = await startDb();
  repo = new DrizzleDeclarationsRepo(t.db);
  await t.db.insert(clients).values({ id: 1, taxNumber: "9000000001", fullName: "Тест Клієнт", email: "c1@example.com" });
});
afterAll(async () => {
  await t.stop();
});

const draft = { clientId: 1, year: 2026, quarter: 1, incomeKopecks: 10_000_000, taxKopecks: 600_000 };

describe("DrizzleDeclarationsRepo", () => {
  it("створює чернетку й повертає її в списку клієнта", async () => {
    const created = await repo.createDraft(draft);

    expect(created).toMatchObject({ status: "draft", quarter: 1, dokatReceiptId: null });
    expect(await repo.listByClient(1)).toHaveLength(1);
  });

  it("відмовляє, якщо клієнта немає", async () => {
    await expect(repo.createDraft({ ...draft, clientId: 999 })).rejects.toMatchObject({ code: "CLIENT_NOT_FOUND" });
  });
});
