import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "unit",
          include: ["tests/**/*.test.ts"],
          exclude: ["tests/integration/**"],
        },
      },
      {
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          // Testcontainers: перший запуск тягне образ postgres:16
          hookTimeout: 120_000,
          fileParallelism: false,
        },
      },
    ],
  },
});
