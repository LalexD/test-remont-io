import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { closeDb, db } from '@/db/client.js';
import { expenses } from '@/db/schema/expense.js';

const seedExpenses = [
  {
    id: 'a0000000-0000-4000-8000-000000000001',
    name: 'Продукты',
    sum: '2450.50',
    date: '2026-06-01',
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000002',
    name: 'Транспорт',
    sum: '320.00',
    date: '2026-06-02',
    createdAt: '2026-06-02T10:00:00.000Z',
    updatedAt: '2026-06-02T10:00:00.000Z',
  },
  {
    id: 'a0000000-0000-4000-8000-000000000003',
    name: 'Коммунальные',
    sum: '5800.00',
    date: '2026-06-03',
    createdAt: '2026-06-03T10:00:00.000Z',
    updatedAt: '2026-06-03T10:00:00.000Z',
  },
] as const;

async function seed(): Promise<void> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(expenses);

  if (count > 0) {
    console.log('Seed skipped: expenses table is not empty');
    return;
  }

  await db.insert(expenses).values([...seedExpenses]);
  console.log(`Seeded ${seedExpenses.length} expense records`);
}

seed()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
