import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { sql } from "drizzle-orm";
import { createDb, type Db } from "../../src/store/db";
import { runMigrations } from "../../src/store/migrate";

export interface TestDb {
  db: Db;
  stop(): Promise<void>;
}

// Postgres 16 у Testcontainers (потрібен Docker), міграції drizzle/.
export async function startDb(): Promise<TestDb> {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer("postgres:16").start();
  const { db, pool } = createDb(container.getConnectionUri());
  await runMigrations(db);
  return {
    db,
    stop: async () => {
      await pool.end();
      await container.stop();
    },
  };
}

export async function tableNames(db: Db): Promise<string[]> {
  const result = await db.execute<{ table_name: string }>(
    sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name`,
  );
  return result.rows.map((row) => row.table_name);
}
