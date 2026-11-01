export const PG_FOREIGN_KEY_VIOLATION = "23503";

// Drizzle загортає помилку драйвера в cause.
export function pgErrorCode(error: unknown): string | undefined {
  return (error as { cause?: { code?: string } }).cause?.code;
}
