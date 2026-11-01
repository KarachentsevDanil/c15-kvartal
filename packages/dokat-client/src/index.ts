export interface DokatDeclaration {
  taxNumber: string;
  year: number;
  quarter: number;
  incomeKopecks: number;
  taxKopecks: number;
}

export interface DokatReceipt {
  receiptId: string;
}

export class DokatError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
  ) {
    super(`ДокатAPI: ${status} ${code}`);
    this.name = "DokatError";
  }
}

export interface DokatClientOptions {
  baseUrl: string;
  apiKey: string;
  fetch?: typeof fetch;
}

export class DokatClient {
  private readonly fetch: typeof fetch;

  constructor(private readonly options: DokatClientOptions) {
    this.fetch = options.fetch ?? globalThis.fetch;
  }

  async submit(declaration: DokatDeclaration): Promise<DokatReceipt> {
    const response = await this.fetch(`${this.options.baseUrl}/v1/declarations`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${this.options.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(declaration),
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      throw new DokatError(response.status, body.error ?? "UNKNOWN");
    }
    return (await response.json()) as DokatReceipt;
  }
}
