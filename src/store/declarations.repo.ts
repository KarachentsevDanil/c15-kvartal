import { asc, eq } from "drizzle-orm";
import { clientNotFound } from "../declarations/errors";
import type { DeclarationsRepo, DraftInput } from "../declarations/service";
import type { Db } from "./db";
import { PG_FOREIGN_KEY_VIOLATION, pgErrorCode } from "./errors";
import { declarations, type Declaration } from "./schema";

export class DrizzleDeclarationsRepo implements DeclarationsRepo {
  constructor(private readonly db: Db) {}

  async listByClient(clientId: number): Promise<Declaration[]> {
    return this.db
      .select()
      .from(declarations)
      .where(eq(declarations.clientId, clientId))
      .orderBy(asc(declarations.year), asc(declarations.quarter));
  }

  async createDraft(values: DraftInput & { taxKopecks: number }): Promise<Declaration> {
    try {
      const [row] = await this.db.insert(declarations).values(values).returning();
      return row;
    } catch (error) {
      if (pgErrorCode(error) === PG_FOREIGN_KEY_VIOLATION) {
        throw clientNotFound();
      }
      throw error;
    }
  }
}
