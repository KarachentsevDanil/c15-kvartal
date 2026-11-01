import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DrizzleDeclarationsRepo } from "../../src/store/declarations.repo";
import { clients, filingAttempts } from "../../src/store/schema";
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

  it("відмовляє у другій декларації за той самий період", async () => {
    await expect(repo.createDraft(draft)).rejects.toMatchObject({ code: "DECLARATION_EXISTS" });
  });

  it("знаходить декларацію для подання разом із податковим номером клієнта", async () => {
    const { id } = await repo.createDraft({ ...draft, quarter: 2 });

    expect(await repo.findForFiling(id)).toMatchObject({ id, taxNumber: "9000000001" });
    expect(await repo.findForFiling(999)).toBeUndefined();
  });

  it("записує вдалу спробу й квитанцію", async () => {
    const { id } = await repo.createDraft({ ...draft, quarter: 3 });
    const at = new Date("2026-11-03T09:00:00Z");

    const filed = await repo.recordAttempt(id, { outcome: "accepted", at, receiptId: "DK-1" });

    expect(filed).toMatchObject({ status: "submitted", dokatReceiptId: "DK-1", submittedAt: at });
    expect(await t.db.select().from(filingAttempts).where(eq(filingAttempts.declarationId, id))).toMatchObject([
      { outcome: "accepted", errorCode: null },
    ]);
  });

  it("лишає чернетку після технічного збою", async () => {
    const { id } = await repo.createDraft({ ...draft, quarter: 4 });

    const declaration = await repo.recordAttempt(id, { outcome: "failed", at: new Date(), errorCode: "DOKAT_UNAVAILABLE" });

    expect(declaration.status).toBe("draft");
  });
});
