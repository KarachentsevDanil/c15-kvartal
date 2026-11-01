import type { Declaration } from "../store/schema";
import { calculateTaxKopecks } from "./tax";

export interface DraftInput {
  clientId: number;
  year: number;
  quarter: number;
  incomeKopecks: number;
}

export interface DeclarationsRepo {
  listByClient(clientId: number): Promise<Declaration[]>;
  createDraft(values: DraftInput & { taxKopecks: number }): Promise<Declaration>;
}

export async function createDraft(repo: DeclarationsRepo, input: DraftInput): Promise<Declaration> {
  return repo.createDraft({ ...input, taxKopecks: calculateTaxKopecks(input.incomeKopecks) });
}
