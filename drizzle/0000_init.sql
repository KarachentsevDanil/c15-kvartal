CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"tax_number" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clients_tax_number_unique" UNIQUE("tax_number")
);
--> statement-breakpoint
CREATE TABLE "declarations" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"year" integer NOT NULL,
	"quarter" integer NOT NULL,
	"income_kopecks" bigint NOT NULL,
	"tax_kopecks" bigint NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"dokat_receipt_id" text,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "declarations" ADD CONSTRAINT "declarations_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;