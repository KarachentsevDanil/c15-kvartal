import { bigint, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  taxNumber: text("tax_number").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const declarations = pgTable("declarations", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  year: integer("year").notNull(),
  quarter: integer("quarter").notNull(),
  incomeKopecks: bigint("income_kopecks", { mode: "number" }).notNull(),
  taxKopecks: bigint("tax_kopecks", { mode: "number" }).notNull(),
  status: text("status", { enum: ["draft", "submitted", "rejected"] })
    .notNull()
    .default("draft"),
  dokatReceiptId: text("dokat_receipt_id"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Client = typeof clients.$inferSelect;
export type Declaration = typeof declarations.$inferSelect;
