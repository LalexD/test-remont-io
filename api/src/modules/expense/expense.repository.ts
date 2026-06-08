import { desc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/db/client.js';
import { expenses, type ExpenseRecord } from '@/db/schema/expense.js';
import type { ChangeDto, ExpenseDto, SyncError, SyncResponse } from './expense.types.js';

function toIsoTimestamp(value: string): string {
  return new Date(value).toISOString();
}

function toDto(record: ExpenseRecord): ExpenseDto {
  return {
    id: record.id,
    name: record.name,
    sum: Number(record.sum),
    date: record.date,
    updatedAt: toIsoTimestamp(record.updatedAt),
    deletedAt: record.deletedAt ? toIsoTimestamp(record.deletedAt) : null,
  };
}

function toInsertValues(id: string, data: { name: string; sum: number; date: string }) {
  const now = new Date().toISOString();

  return {
    id,
    name: data.name,
    sum: data.sum.toFixed(2),
    date: data.date,
    createdAt: now,
    updatedAt: now,
  };
}

function toUpdateValues(data: { name: string; sum: number; date: string }) {
  return {
    name: data.name,
    sum: data.sum.toFixed(2),
    date: data.date,
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };
}

type DbExecutor = Pick<typeof db, 'insert' | 'update' | 'select'>;

async function applyCreate(
  executor: DbExecutor,
  change: Extract<ChangeDto, { op: 'create' }>,
  applied: string[],
): Promise<void> {
  await executor
    .insert(expenses)
    .values(toInsertValues(change.id, change.data))
    .onConflictDoUpdate({
      target: expenses.id,
      set: toUpdateValues(change.data),
    });

  applied.push(change.id);
}

async function applyDelete(
  executor: DbExecutor,
  change: Extract<ChangeDto, { op: 'delete' }>,
  applied: string[],
): Promise<void> {
  const now = new Date().toISOString();

  await executor
    .update(expenses)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(expenses.id, change.id));

  applied.push(change.id);
}

async function applyChange(
  executor: DbExecutor,
  change: ChangeDto,
  applied: string[],
): Promise<void> {
  switch (change.op) {
    case 'create':
      await applyCreate(executor, change, applied);
      break;
    case 'delete':
      await applyDelete(executor, change, applied);
      break;
  }
}

async function findExpensesSince(
  executor: DbExecutor,
  since: string | null,
): Promise<ExpenseDto[]> {
  if (since === null) {
    const records = await executor
      .select()
      .from(expenses)
      .where(isNull(expenses.deletedAt))
      .orderBy(desc(expenses.updatedAt));

    return records.map(toDto);
  }

  const sinceIso = toIsoTimestamp(since);
  const records = await executor
    .select()
    .from(expenses)
    .where(sql`${expenses.updatedAt}::timestamptz > ${sinceIso}::timestamptz`)
    .orderBy(desc(expenses.updatedAt));

  return records.map(toDto);
}

export async function syncExpenses(
  changes: ChangeDto[],
  lastSyncTimestamp: string | null | undefined,
): Promise<SyncResponse> {
  return db.transaction(async (tx) => {
    const applied: string[] = [];
    const errors: SyncError[] = [];

    for (const change of changes) {
      await applyChange(tx, change, applied);
    }

    if (lastSyncTimestamp === undefined) {
      return { applied, errors, expenses: [] };
    }

    const [{ serverTimestamp }] = await tx.execute<{ serverTimestamp: string }>(
      sql`select now()::text as "serverTimestamp"`,
    );
    const pulledExpenses = await findExpensesSince(tx, lastSyncTimestamp);

    return {
      applied,
      errors,
      expenses: pulledExpenses,
      serverTimestamp,
    };
  });
}
