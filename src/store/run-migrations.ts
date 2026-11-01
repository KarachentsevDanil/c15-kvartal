import { loadConfig } from "../config";
import { createDb } from "./db";
import { runMigrations } from "./migrate";

const { db, pool } = createDb(loadConfig().databaseUrl);
await runMigrations(db);
await pool.end();
console.log("migrations applied");
