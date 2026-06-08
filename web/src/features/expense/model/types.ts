import type { CreateExpenseFormValues } from './createExpenseForm.schema'

export type SyncStatus = 'synced' | 'pending' | 'failed'

export type LocalExpense = {
  id: string
  name: string
  sum: number
  date: string
  syncStatus: SyncStatus
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export type ChangeOp = 'create' | 'delete'

export type SyncQueueEntry = {
  id: string
  expenseId: string
  op: ChangeOp
  createdAt: string
  retries: number
}

export type SyncMeta = {
  key: 'lastSyncTimestamp'
  value: string | null
}

export type Expense = {
  id: string
  name: string
  sum: number
  date: string
  syncStatus: SyncStatus
}

export type CreateExpenseDto = CreateExpenseFormValues

export type ChangeDto =
  | { op: 'create'; id: string; data: CreateExpenseDto }
  | { op: 'delete'; id: string }

export type ServerExpense = {
  id: string
  name: string
  sum: number
  date: string
  updatedAt: string
  deletedAt: string | null
}

export type SyncError = {
  id: string
  op: ChangeOp
  message: string
}

export type SyncResponse = {
  applied: string[]
  errors: SyncError[]
  expenses: ServerExpense[]
  serverTimestamp?: string
}
