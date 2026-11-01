import { describe, expect, it } from "vitest";
import { calculateTaxKopecks } from "../../src/declarations/tax";

describe("calculateTaxKopecks", () => {
  it("рахує 6 % від доходу: єдиний податок і військовий збір", () => {
    expect(calculateTaxKopecks(10_000_000)).toBe(600_000);
  });

  it("округлює кожну складову до копійки окремо", () => {
    expect(calculateTaxKopecks(150)).toBe(10);
  });

  it("повертає нуль на нульовому доході", () => {
    expect(calculateTaxKopecks(0)).toBe(0);
  });
});
