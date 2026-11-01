import { loadConfig } from "../config";
import { createDb } from "./db";
import { resetDatabase } from "./reset";

const { db, pool } = createDb(loadConfig().databaseUrl);
await resetDatabase(db);
await pool.end();
console.log("database reset, migrations applied");
