import * as expenseRepository from './expense.repository.js';
import type { SyncChangesBody } from './expense.schema.js';
import type { SyncResponse } from './expense.types.js';

export async function syncExpenses(body: SyncChangesBody): Promise<SyncResponse> {
  return expenseRepository.syncExpenses(body.changes, body.lastSyncTimestamp);
}
