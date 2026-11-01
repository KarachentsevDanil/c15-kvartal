import dotenv from "dotenv";

export interface Config {
  port: number;
  databaseUrl: string;
  dokatApiUrl: string;
  dokatApiKey: string;
}

export function loadConfig(): Config {
  dotenv.config({ quiet: true });

  const postgresPort = process.env.POSTGRES_PORT ?? "5432";

  return {
    port: Number(process.env.PORT ?? 3000),
    databaseUrl: process.env.DATABASE_URL ?? `postgres://kvartal:kvartal@localhost:${postgresPort}/kvartal`,
    dokatApiUrl: process.env.DOKAT_API_URL ?? "http://localhost:4010",
    dokatApiKey: process.env.DOKAT_API_KEY ?? "dokat_test_local",
  };
}
