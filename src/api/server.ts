import { loadConfig } from "../config";
import { createDb } from "../store/db";
import { DrizzleDeclarationsRepo } from "../store/declarations.repo";
import { buildApp } from "./app";

const config = loadConfig();
const { db } = createDb(config.databaseUrl);

const app = buildApp({ declarations: new DrizzleDeclarationsRepo(db) }, { logger: true });

await app.listen({ port: config.port, host: "0.0.0.0" });
