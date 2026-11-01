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
