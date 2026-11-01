import { loadConfig } from "../config";
import { buildApp } from "./app";

const config = loadConfig();
const app = buildApp({ logger: true });

await app.listen({ port: config.port, host: "0.0.0.0" });
