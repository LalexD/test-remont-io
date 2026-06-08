import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getDatabaseUrl } from '@/db/utils/getDatabaseUrl.js';
import * as schema from '@/db/schema.js';

const client = postgres(getDatabaseUrl(), { max: 10 });

export const db = drizzle(client, { schema });

export async function checkDbConnection(): Promise<void> {
  await db.execute(sql`select 1`);
}

export async function closeDb(): Promise<void> {
  await client.end();
}
