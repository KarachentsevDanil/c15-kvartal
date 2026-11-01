export class DomainError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(code);
    this.name = "DomainError";
  }
}

export const clientNotFound = () => new DomainError(404, "CLIENT_NOT_FOUND");
export const declarationExists = () => new DomainError(409, "DECLARATION_EXISTS");
export const declarationNotFound = () => new DomainError(404, "DECLARATION_NOT_FOUND");
export const alreadySubmitted = () => new DomainError(409, "ALREADY_SUBMITTED");
export const dokatRejected = (code: string) => new DomainError(422, code);
export const dokatUnavailable = () => new DomainError(502, "DOKAT_UNAVAILABLE");
