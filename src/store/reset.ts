import { sql } from "drizzle-orm";
import type { Db } from "./db";
import { runMigrations } from "./migrate";

// Видаляє схему застосунку й службову схему міграцій Drizzle, потім застосовує міграції заново.
export async function resetDatabase(db: Db): Promise<void> {
  await db.execute(sql`drop schema if exists public cascade`);
  await db.execute(sql`drop schema if exists drizzle cascade`);
  await db.execute(sql`create schema public`);
  await runMigrations(db);
}
