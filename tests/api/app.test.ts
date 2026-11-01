import { describe, expect, it, vi } from "vitest";
import { type AppDeps, buildApp } from "../../src/api/app";
import { clientNotFound, declarationExists } from "../../src/declarations/errors";

const draft = { clientId: 1, year: 2026, quarter: 3, incomeKopecks: 10_000_000 };

function setup(overrides: Partial<AppDeps["declarations"]> = {}) {
  return buildApp({
    declarations: {
      listByClient: vi.fn().mockResolvedValue([]),
      createDraft: vi.fn(async (values) => ({ id: 7, status: "draft", ...values })),
      findForFiling: vi.fn().mockResolvedValue(undefined),
      recordAttempt: vi.fn(),
      ...overrides,
    } as AppDeps["declarations"],
    dokat: { submit: vi.fn() },
    now: () => new Date("2026-11-03T09:00:00Z"),
  });
}

describe("GET /health", () => {
  it("відповідає 200", async () => {
    const response = await setup().inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });
});

describe("POST /declarations", () => {
  it("створює чернетку з розрахованим податком", async () => {
    const response = await setup().inject({ method: "POST", url: "/declarations", payload: draft });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toMatchObject({ id: 7, status: "draft", taxKopecks: 600_000 });
  });

  it("відмовляє на кварталі поза 1–4", async () => {
    const response = await setup().inject({ method: "POST", url: "/declarations", payload: { ...draft, quarter: 5 } });

    expect(response.statusCode).toBe(400);
  });

  it("відповідає 404, якщо клієнта немає", async () => {
    const app = setup({ createDraft: vi.fn().mockRejectedValue(clientNotFound()) });

    const response = await app.inject({ method: "POST", url: "/declarations", payload: draft });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "CLIENT_NOT_FOUND" });
  });
});

describe("POST /declarations, повторний період", () => {
  it("відповідає 409, якщо декларація за період уже є", async () => {
    const app = setup({ createDraft: vi.fn().mockRejectedValue(declarationExists()) });

    const response = await app.inject({ method: "POST", url: "/declarations", payload: draft });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({ error: "DECLARATION_EXISTS" });
  });
});

describe("POST /declarations/:id/submit", () => {
  it("відповідає 404, якщо декларації немає", async () => {
    const response = await setup().inject({ method: "POST", url: "/declarations/7/submit" });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: "DECLARATION_NOT_FOUND" });
  });
});
