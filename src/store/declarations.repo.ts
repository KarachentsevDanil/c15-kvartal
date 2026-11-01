import { asc, eq, getTableColumns } from "drizzle-orm";
import { clientNotFound } from "../declarations/errors";
import type { DeclarationForFiling, DeclarationsRepo, DraftInput, FilingAttemptInput } from "../declarations/service";
import type { Db } from "./db";
import { PG_FOREIGN_KEY_VIOLATION, pgErrorCode } from "./errors";
import { clients, declarations, filingAttempts, type Declaration } from "./schema";

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

  async findForFiling(id: number): Promise<DeclarationForFiling | undefined> {
    const [row] = await this.db
      .select({ ...getTableColumns(declarations), taxNumber: clients.taxNumber })
      .from(declarations)
      .innerJoin(clients, eq(clients.id, declarations.clientId))
      .where(eq(declarations.id, id))
      .limit(1);
    return row;
  }

  async recordAttempt(id: number, attempt: FilingAttemptInput): Promise<Declaration> {
    return this.db.transaction(async (tx) => {
      await tx.insert(filingAttempts).values({
        declarationId: id,
        outcome: attempt.outcome,
        errorCode: attempt.errorCode,
        attemptedAt: attempt.at,
      });

      if (attempt.outcome === "accepted") {
        await tx
          .update(declarations)
          .set({ status: "submitted", dokatReceiptId: attempt.receiptId, submittedAt: attempt.at })
          .where(eq(declarations.id, id));
      }
      if (attempt.outcome === "rejected") {
        await tx.update(declarations).set({ status: "rejected" }).where(eq(declarations.id, id));
      }

      const [row] = await tx.select().from(declarations).where(eq(declarations.id, id));
      return row;
    });
  }
}
