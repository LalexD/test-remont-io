import { db } from '@/shared/db/database'
import type {
  CreateExpenseDto,
  LocalExpense,
  ServerExpense,
  SyncQueueEntry,
  SyncStatus,
} from '../model/types'

const LAST_SYNC_KEY = 'lastSyncTimestamp' as const

function nowIso(): string {
  return new Date().toISOString()
}

function createId(): string {
  return crypto.randomUUID()
}

function buildLocalExpense(data: CreateExpenseDto, syncStatus: SyncStatus): LocalExpense {
  const timestamp = nowIso()

  return {
    id: createId(),
    name: data.name,
      sum: data.sum,
    date: data.date,
    syncStatus,
    deletedAt: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
}

function buildSyncQueueEntry(
  expenseId: string,
  op: SyncQueueEntry['op'],
): SyncQueueEntry {
  return {
    id: createId(),
    expenseId,
    op,
    createdAt: nowIso(),
    retries: 0,
  }
}

async function addSyncQueueEntry(entry: SyncQueueEntry): Promise<void> {
  await db.syncQueue.put(entry)
}

async function removeSyncQueueForExpense(expenseId: string): Promise<void> {
  await db.syncQueue.where('expenseId').equals(expenseId).delete()
}

export const expenseRepository = {
  async getAllVisible(): Promise<LocalExpense[]> {
    const records = await db.expenses.toArray()
    return records
      .filter((record) => record.deletedAt === null)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  },

  async getById(id: string): Promise<LocalExpense | undefined> {
    return db.expenses.get(id)
  },

  async getSyncQueueEntries(): Promise<SyncQueueEntry[]> {
    return db.syncQueue.orderBy('createdAt').toArray()
  },

  async getExpensesMap(ids: string[]): Promise<Map<string, LocalExpense>> {
    const expenses = await db.expenses.bulkGet(ids)
    const map = new Map<string, LocalExpense>()

    for (const expense of expenses) {
      if (expense) {
        map.set(expense.id, expense)
      }
    }

    return map
  },

  async getLastSyncTimestamp(): Promise<string | null> {
    const meta = await db.syncMeta.get(LAST_SYNC_KEY)
    return meta?.value ?? null
  },

  async getEffectiveLastSyncTimestamp(): Promise<string | null> {
    const stored = await expenseRepository.getLastSyncTimestamp()
    if (stored !== null) {
      return stored
    }

    const syncedExpenses = await db.expenses
      .filter((expense) => expense.syncStatus === 'synced' && expense.deletedAt === null)
      .toArray()

    if (syncedExpenses.length === 0) {
      return null
    }

    return syncedExpenses.reduce(
      (latest, expense) => (expense.updatedAt > latest ? expense.updatedAt : latest),
      syncedExpenses[0]!.updatedAt,
    )
  },

  async setLastSyncTimestamp(value: string): Promise<void> {
    await db.syncMeta.put({ key: LAST_SYNC_KEY, value: new Date(value).toISOString() })
  },

  async createLocal(data: CreateExpenseDto): Promise<LocalExpense> {
    const record = buildLocalExpense(data, 'pending')

    await db.transaction('rw', db.expenses, db.syncQueue, async () => {
      await db.expenses.put(record)
      await addSyncQueueEntry(buildSyncQueueEntry(record.id, 'create'))
    })

    return record
  },

  async deleteLocal(id: string): Promise<void> {
    const existing = await db.expenses.get(id)
    if (!existing) {
      return
    }

    const timestamp = nowIso()

    await db.transaction('rw', db.expenses, db.syncQueue, async () => {
      await db.expenses.update(id, {
        deletedAt: timestamp,
        syncStatus: 'pending',
        updatedAt: timestamp,
      })
      await addSyncQueueEntry(buildSyncQueueEntry(id, 'delete'))
    })
  },

  async markSynced(expenseIds: string[]): Promise<void> {
    await db.transaction('rw', db.expenses, db.syncQueue, async () => {
      for (const expenseId of expenseIds) {
        await db.expenses.update(expenseId, { syncStatus: 'synced' })
        await removeSyncQueueForExpense(expenseId)
      }
    })
  },

  async markFailed(expenseIds: string[]): Promise<void> {
    const timestamp = nowIso()

    await db.expenses.bulkUpdate(
      expenseIds.map((id) => ({ key: id, changes: { syncStatus: 'failed', updatedAt: timestamp } })),
    )
  },

  async removeNoopFromQueue(expenseIds: string[]): Promise<void> {
    await db.transaction('rw', db.expenses, db.syncQueue, async () => {
      for (const expenseId of expenseIds) {
        await removeSyncQueueForExpense(expenseId)
        const expense = await db.expenses.get(expenseId)
        if (expense && expense.deletedAt !== null && expense.syncStatus === 'pending') {
          await db.expenses.delete(expenseId)
        }
      }
    })
  },

  async incrementSyncQueueRetries(expenseIds: string[]): Promise<void> {
    const entries = await db.syncQueue.where('expenseId').anyOf(expenseIds).toArray()

    await db.syncQueue.bulkUpdate(
      entries.map((entry) => ({
        key: entry.id,
        changes: { retries: entry.retries + 1 },
      })),
    )
  },

  async mergeRemoteExpenses(serverExpenses: ServerExpense[]): Promise<void> {
    await db.transaction('rw', db.expenses, db.syncQueue, async () => {
      for (const serverExpense of serverExpenses) {
        const existing = await db.expenses.get(serverExpense.id)
        const pendingEntry = await db.syncQueue.where('expenseId').equals(serverExpense.id).first()

        if (existing && (pendingEntry !== undefined || existing.syncStatus === 'pending')) {
          continue
        }

        if (serverExpense.deletedAt !== null) {
          if (existing) {
            await db.expenses.delete(serverExpense.id)
            await removeSyncQueueForExpense(serverExpense.id)
          }
          continue
        }

        const timestamp = nowIso()

        await db.expenses.put({
          id: serverExpense.id,
          name: serverExpense.name,
          sum: serverExpense.sum,
          date: serverExpense.date,
          syncStatus: 'synced',
          deletedAt: null,
          createdAt: existing?.createdAt ?? timestamp,
          updatedAt: serverExpense.updatedAt,
        })
      }
    })
  },

  async purgeSyncedDeleted(): Promise<void> {
    const deleted = await db.expenses
      .filter((expense) => expense.deletedAt !== null && expense.syncStatus === 'synced')
      .toArray()

    await db.expenses.bulkDelete(deleted.map((expense) => expense.id))
  },
}
