import { syncChangesInChunks } from '../api/expenseApi'
import { expenseRepository } from '../repository/expenseRepository'
import { coalesceSyncQueue } from './coalesceSyncQueue'

export type SyncResult = {
  pushed: number
  pulled: number
  failed: number
}

const SYNC_DEBOUNCE_MS = 1000

let debounceTimer: ReturnType<typeof setTimeout> | null = null
let syncInProgress = false

export function scheduleExpenseSync(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    debounceTimer = null
    void runExpenseSync()
  }, SYNC_DEBOUNCE_MS)
}

async function handleChunkSuccess(applied: string[]): Promise<void> {
  if (applied.length === 0) {
    return
  }

  await expenseRepository.markSynced(applied)
}

export async function runExpenseSync(): Promise<SyncResult> {
  if (syncInProgress) {
    return { pushed: 0, pulled: 0, failed: 0 }
  }

  syncInProgress = true

  try {
    const queueEntries = await expenseRepository.getSyncQueueEntries()
    const expenseIds = [...new Set(queueEntries.map((entry) => entry.expenseId))]
    const expensesById = await expenseRepository.getExpensesMap(expenseIds)
    const { changes, noopExpenseIds } = coalesceSyncQueue(queueEntries, expensesById)

    if (noopExpenseIds.length > 0) {
      await expenseRepository.removeNoopFromQueue(noopExpenseIds)
    }

    const lastSyncTimestamp = await expenseRepository.getEffectiveLastSyncTimestamp()
    let pushed = 0
    let failed = 0

    const response = await syncChangesInChunks(changes, lastSyncTimestamp, async (chunkResponse) => {
      if (chunkResponse.applied.length > 0) {
        await handleChunkSuccess(chunkResponse.applied)
        pushed += chunkResponse.applied.length
      }

      if (chunkResponse.errors.length > 0) {
        const failedIds = chunkResponse.errors.map((error) => error.id)
        await expenseRepository.markFailed(failedIds)
        await expenseRepository.incrementSyncQueueRetries(failedIds)
        failed += chunkResponse.errors.length
      }
    })

    if (response.serverTimestamp) {
      await expenseRepository.setLastSyncTimestamp(response.serverTimestamp)
    }

    if (response.expenses.length > 0) {
      await expenseRepository.mergeRemoteExpenses(response.expenses)
    }

    await expenseRepository.purgeSyncedDeleted()

    return {
      pushed,
      pulled: response.expenses.length,
      failed,
    }
  } catch {
    const queueEntries = await expenseRepository.getSyncQueueEntries()
    const expenseIds = [...new Set(queueEntries.map((entry) => entry.expenseId))]
    await expenseRepository.markFailed(expenseIds)
    await expenseRepository.incrementSyncQueueRetries(expenseIds)

    return { pushed: 0, pulled: 0, failed: expenseIds.length }
  } finally {
    syncInProgress = false
  }
}
