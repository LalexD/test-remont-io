CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(30) NOT NULL,
	"sum" numeric(12, 2) NOT NULL,
	"date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
