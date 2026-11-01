import { type DokatClient, DokatError } from "@kvartal/dokat-client";
import type { Declaration } from "../store/schema";
import { alreadySubmitted, declarationNotFound, dokatRejected, dokatUnavailable } from "./errors";
import { calculateTaxKopecks } from "./tax";

export interface DraftInput {
  clientId: number;
  year: number;
  quarter: number;
  incomeKopecks: number;
}

export type DeclarationForFiling = Declaration & { taxNumber: string };

export interface FilingAttemptInput {
  outcome: "accepted" | "rejected" | "failed";
  at: Date;
  receiptId?: string;
  errorCode?: string;
}

export interface DeclarationsRepo {
  listByClient(clientId: number): Promise<Declaration[]>;
  createDraft(values: DraftInput & { taxKopecks: number }): Promise<Declaration>;
  findForFiling(id: number): Promise<DeclarationForFiling | undefined>;
  recordAttempt(id: number, attempt: FilingAttemptInput): Promise<Declaration>;
}

export interface FilingDeps {
  declarations: DeclarationsRepo;
  dokat: Pick<DokatClient, "submit">;
  now: () => Date;
}

export async function createDraft(repo: DeclarationsRepo, input: DraftInput): Promise<Declaration> {
  return repo.createDraft({ ...input, taxKopecks: calculateTaxKopecks(input.incomeKopecks) });
}

export async function fileDeclaration(deps: FilingDeps, id: number): Promise<Declaration> {
  const declaration = await deps.declarations.findForFiling(id);
  if (!declaration) {
    throw declarationNotFound();
  }
  if (declaration.status === "submitted") {
    throw alreadySubmitted();
  }

  try {
    const { receiptId } = await deps.dokat.submit({
      taxNumber: declaration.taxNumber,
      year: declaration.year,
      quarter: declaration.quarter,
      incomeKopecks: declaration.incomeKopecks,
      taxKopecks: declaration.taxKopecks,
    });
    return await deps.declarations.recordAttempt(id, { outcome: "accepted", at: deps.now(), receiptId });
  } catch (error) {
    if (error instanceof DokatError && error.status === 422) {
      await deps.declarations.recordAttempt(id, { outcome: "rejected", at: deps.now(), errorCode: error.code });
      throw dokatRejected(error.code);
    }
    await deps.declarations.recordAttempt(id, { outcome: "failed", at: deps.now(), errorCode: "DOKAT_UNAVAILABLE" });
    throw dokatUnavailable();
  }
}
