import Fastify, { type FastifyServerOptions } from "fastify";
import { DomainError } from "../declarations/errors";
import { createDraft, type DeclarationsRepo, type DraftInput } from "../declarations/service";

export interface AppDeps {
  declarations: DeclarationsRepo;
}

const draftSchema = {
  body: {
    type: "object",
    required: ["clientId", "year", "quarter", "incomeKopecks"],
    additionalProperties: false,
    properties: {
      clientId: { type: "integer", minimum: 1 },
      year: { type: "integer", minimum: 2020 },
      quarter: { type: "integer", minimum: 1, maximum: 4 },
      incomeKopecks: { type: "integer", minimum: 0 },
    },
  },
};

export function buildApp(deps: AppDeps, options: FastifyServerOptions = {}) {
  const app = Fastify(options);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof DomainError) {
      return reply.code(error.status).send({ error: error.code });
    }
    throw error;
  });

  app.get("/health", async () => ({ status: "ok" }));

  app.get<{ Params: { id: string } }>("/clients/:id/declarations", async (request) => ({
    declarations: await deps.declarations.listByClient(Number(request.params.id)),
  }));

  app.post<{ Body: DraftInput }>("/declarations", { schema: draftSchema }, async (request, reply) => {
    return reply.code(201).send(await createDraft(deps.declarations, request.body));
  });

  return app;
}
