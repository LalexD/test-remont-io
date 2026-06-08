import { useLiveQuery } from 'dexie-react-hooks'
import { useCallback } from 'react'
import { db } from '@/shared/db/database'
import { expenseRepository } from '../repository/expenseRepository'
import { scheduleExpenseSync } from '../sync/expenseSyncEngine'
import { toExpenseView } from '../lib/toExpenseView'
import type { CreateExpenseDto } from './types'

export function useExpenses() {
  const localExpenses = useLiveQuery(() => expenseRepository.getAllVisible(), [], [])
  const pendingCount = useLiveQuery(() => db.syncQueue.count(), [], 0) ?? 0
  const expenses = (localExpenses ?? []).map(toExpenseView)

  const addExpense = useCallback(async (data: CreateExpenseDto) => {
    const record = await expenseRepository.createLocal(data)
    scheduleExpenseSync()
    return record
  }, [])

  const removeExpense = useCallback(async (id: string) => {
    await expenseRepository.deleteLocal(id)
    scheduleExpenseSync()
  }, [])

  const total = expenses.reduce((sum, item) => sum + item.sum, 0)

  return {
    expenses,
    total,
    pendingCount,
    addExpense,
    removeExpense,
  }
}
