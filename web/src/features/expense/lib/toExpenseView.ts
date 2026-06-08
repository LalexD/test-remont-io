import type { Expense, LocalExpense } from '../model/types'

export function toExpenseView(record: LocalExpense): Expense {
  return {
    id: record.id,
    name: record.name,
    sum: record.sum,
    date: record.date,
    syncStatus: record.syncStatus,
  }
}
