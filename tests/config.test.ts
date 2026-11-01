import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config";

describe("loadConfig", () => {
  it("повертає налаштування за замовчуванням", () => {
    expect(loadConfig()).toEqual({
      port: 3000,
      databaseUrl: "postgres://kvartal:kvartal@localhost:5432/kvartal",
      dokatApiUrl: "http://localhost:4010",
      dokatApiKey: "dokat_test_local",
    });
  });
});
