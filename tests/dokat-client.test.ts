import { DokatClient, DokatError } from "@kvartal/dokat-client";
import { describe, expect, it, vi } from "vitest";

const declaration = { taxNumber: "9000000001", year: 2026, quarter: 3, incomeKopecks: 15_000_000, taxKopecks: 900_000 };

function client(response: Response) {
  const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(response);
  return { fetch, dokat: new DokatClient({ baseUrl: "http://dokat.test", apiKey: "dokat_test_key", fetch }) };
}

describe("DokatClient.submit", () => {
  it("надсилає декларацію з ключем стенда й повертає квитанцію", async () => {
    const { fetch, dokat } = client(Response.json({ receiptId: "DK-1" }, { status: 201 }));

    expect(await dokat.submit(declaration)).toEqual({ receiptId: "DK-1" });

    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("http://dokat.test/v1/declarations");
    expect(new Headers(init?.headers).get("authorization")).toBe("Bearer dokat_test_key");
    expect(JSON.parse(String(init?.body))).toEqual(declaration);
  });

  it("перетворює відмову на DokatError з кодом причини", async () => {
    const { dokat } = client(Response.json({ error: "INCOME_NEGATIVE" }, { status: 422 }));

    await expect(dokat.submit(declaration)).rejects.toEqual(new DokatError(422, "INCOME_NEGATIVE"));
  });

  it("не падає на відповіді без JSON", async () => {
    const { dokat } = client(new Response("bad gateway", { status: 502 }));

    await expect(dokat.submit(declaration)).rejects.toEqual(new DokatError(502, "UNKNOWN"));
  });
});
