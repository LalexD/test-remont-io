import Dexie, { type EntityTable } from 'dexie'
import type { LocalExpense, SyncMeta, SyncQueueEntry } from '@/features/expense/model/types'

class AppDatabase extends Dexie {
  expenses!: EntityTable<LocalExpense, 'id'>
  syncQueue!: EntityTable<SyncQueueEntry, 'id'>
  syncMeta!: EntityTable<SyncMeta, 'key'>

  constructor() {
    super('ExpenseTrackerDB')

    this.version(1).stores({
      expenses: 'id, syncStatus, date, deletedAt',
      syncQueue: 'id, expenseId, op, createdAt',
      syncMeta: 'key',
    })
  }
}

export const db = new AppDatabase()
