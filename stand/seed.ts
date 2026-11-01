import { loadConfig } from "../src/config";
import { createDb } from "../src/store/db";
import { clients, declarations } from "../src/store/schema";

// Вигадані ФОП для локальної роботи. Повторний запуск нічого не додає.
const seedClients = [
  { taxNumber: "9000000001", fullName: "ФОП Приклад Марія", email: "maria@fop.example" },
  { taxNumber: "9000000002", fullName: "ФОП Зразок Андрій", email: "andrii@fop.example" },
  { taxNumber: "9000000003", fullName: "ФОП Взірець Ірина", email: "iryna@fop.example" },
];

const { db, pool } = createDb(loadConfig().databaseUrl);

const inserted = await db.insert(clients).values(seedClients).onConflictDoNothing().returning({ id: clients.id });

for (const { id: clientId } of inserted) {
  await db.insert(declarations).values([
    {
      clientId,
      year: 2026,
      quarter: 1,
      incomeKopecks: 12_000_000,
      taxKopecks: 720_000,
      status: "submitted",
      dokatReceiptId: `DK-2026-L0${clientId}01`,
      submittedAt: new Date("2026-05-08T10:00:00Z"),
    },
    { clientId, year: 2026, quarter: 2, incomeKopecks: 15_500_000, taxKopecks: 930_000 },
  ]);
}

await pool.end();
console.log(`seeded ${inserted.length} clients`);
