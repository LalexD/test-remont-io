import type { ChangeDto, ChangeOp, LocalExpense, SyncQueueEntry } from '../model/types'

export type CoalesceResult = {
  changes: ChangeDto[]
  noopExpenseIds: string[]
}

function toPayload(expense: LocalExpense) {
  return {
    name: expense.name,
    sum: Number(expense.sum),
    date: String(expense.date).slice(0, 10),
  }
}

export function coalesceSyncQueue(
  entries: SyncQueueEntry[],
  expensesById: Map<string, LocalExpense>,
): CoalesceResult {
  const grouped = new Map<string, SyncQueueEntry[]>()

  for (const entry of entries) {
    const group = grouped.get(entry.expenseId) ?? []
    group.push(entry)
    grouped.set(entry.expenseId, group)
  }

  const changes: ChangeDto[] = []
  const noopExpenseIds: string[] = []

  for (const [expenseId, group] of grouped) {
    const sorted = [...group].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    let hasCreate = false
    let resultOp: ChangeOp | null = null

    for (const entry of sorted) {
      if (entry.op === 'create') {
        hasCreate = true
        resultOp = 'create'
      } else if (entry.op === 'delete') {
        if (hasCreate) {
          resultOp = null
          break
        }

        resultOp = 'delete'
      }
    }

    if (resultOp === null) {
      noopExpenseIds.push(expenseId)
      continue
    }

    const expense = expensesById.get(expenseId)

    if (resultOp === 'delete') {
      changes.push({ op: 'delete', id: expenseId })
      continue
    }

    if (!expense || expense.deletedAt !== null) {
      noopExpenseIds.push(expenseId)
      continue
    }

    const payload = toPayload(expense)

    if (resultOp === 'create') {
      changes.push({ op: 'create', id: expenseId, data: payload })
    }
  }

  return { changes, noopExpenseIds }
}

