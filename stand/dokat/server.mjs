// Заглушка тестового стенда ДокатAPI: перевіряє ключ і приймає декларації. Назовні нічого не надсилає.
import { createServer } from "node:http";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const API_KEY = process.env.DOKAT_API_KEY ?? "dokat_test_local";
const PORT = Number(process.env.DOKAT_PORT ?? 4010);

let receipts = 0;

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

const server = createServer(async (request, response) => {
  const reply = (status, body) => {
    response.writeHead(status, { "content-type": "application/json" });
    response.end(JSON.stringify(body));
  };

  if (request.method === "POST" && request.url === "/v1/declarations") {
    if (request.headers.authorization !== `Bearer ${API_KEY}`) {
      return reply(401, { error: "INVALID_API_KEY" });
    }
    const declaration = JSON.parse(await readBody(request));
    if (!/^\d{10}$/.test(declaration.taxNumber)) {
      return reply(422, { error: "TAX_NUMBER_INVALID" });
    }
    receipts += 1;
    const receiptId = `DK-${declaration.year}-${String(receipts).padStart(6, "0")}`;
    console.log(`Прийнято: ${receiptId}`);
    return reply(201, { receiptId });
  }

  return reply(404, { error: "NOT_FOUND" });
});

server.listen(PORT, "127.0.0.1", () => console.log(`ДокатAPI слухає порт ${PORT}`));
