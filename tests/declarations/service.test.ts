import { DokatError } from "@kvartal/dokat-client";
import { describe, expect, it, vi } from "vitest";
import { type DeclarationForFiling, fileDeclaration, type FilingDeps } from "../../src/declarations/service";

const now = new Date("2026-11-03T09:00:00Z");

const draft = {
  id: 7,
  taxNumber: "9000000001",
  year: 2026,
  quarter: 3,
  incomeKopecks: 10_000_000,
  taxKopecks: 600_000,
  status: "draft",
} as DeclarationForFiling;

function setup(overrides: { found?: DeclarationForFiling; submit?: FilingDeps["dokat"]["submit"] } = {}) {
  const recordAttempt = vi.fn().mockResolvedValue({ ...draft, status: "submitted" });
  const deps = {
    declarations: { findForFiling: vi.fn().mockResolvedValue("found" in overrides ? overrides.found : draft), recordAttempt },
    dokat: { submit: overrides.submit ?? vi.fn().mockResolvedValue({ receiptId: "DK-1" }) },
    now: () => now,
  } as unknown as FilingDeps;
  return { deps, recordAttempt };
}

describe("fileDeclaration", () => {
  it("подає декларацію й записує квитанцію", async () => {
    const { deps, recordAttempt } = setup();

    await fileDeclaration(deps, 7);

    expect(deps.dokat.submit).toHaveBeenCalledWith({
      taxNumber: "9000000001",
      year: 2026,
      quarter: 3,
      incomeKopecks: 10_000_000,
      taxKopecks: 600_000,
    });
    expect(recordAttempt).toHaveBeenCalledWith(7, { outcome: "accepted", at: now, receiptId: "DK-1" });
  });

  it("не подає декларацію, якої немає", async () => {
    const { deps } = setup({ found: undefined });

    await expect(fileDeclaration(deps, 7)).rejects.toMatchObject({ status: 404, code: "DECLARATION_NOT_FOUND" });
  });

  it("не подає вдруге вже подану декларацію", async () => {
    const { deps } = setup({ found: { ...draft, status: "submitted" } });

    await expect(fileDeclaration(deps, 7)).rejects.toMatchObject({ status: 409, code: "ALREADY_SUBMITTED" });
    expect(deps.dokat.submit).not.toHaveBeenCalled();
  });

  it("записує відмову ДокатAPI з кодом причини", async () => {
    const { deps, recordAttempt } = setup({ submit: vi.fn().mockRejectedValue(new DokatError(422, "INCOME_NEGATIVE")) });

    await expect(fileDeclaration(deps, 7)).rejects.toMatchObject({ status: 422, code: "INCOME_NEGATIVE" });
    expect(recordAttempt).toHaveBeenCalledWith(7, { outcome: "rejected", at: now, errorCode: "INCOME_NEGATIVE" });
  });

  it("лишає чернетку, якщо ДокатAPI недоступний", async () => {
    const { deps, recordAttempt } = setup({ submit: vi.fn().mockRejectedValue(new Error("fetch failed")) });

    await expect(fileDeclaration(deps, 7)).rejects.toMatchObject({ status: 502, code: "DOKAT_UNAVAILABLE" });
    expect(recordAttempt).toHaveBeenCalledWith(7, { outcome: "failed", at: now, errorCode: "DOKAT_UNAVAILABLE" });
  });
});
