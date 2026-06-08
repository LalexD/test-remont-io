import { apiClient } from '@/shared/api/client'
import { chunk } from '@/shared/lib/chunk'
import type { ChangeDto, SyncResponse } from '../model/types'

export const SYNC_CHUNK_SIZE = 100

export async function syncChanges(
  changes: ChangeDto[],
  lastSyncTimestamp?: string | null,
): Promise<SyncResponse> {
  const body: { changes: ChangeDto[]; lastSyncTimestamp?: string | null } = { changes }

  if (lastSyncTimestamp !== undefined) {
    body.lastSyncTimestamp = lastSyncTimestamp
  }

  const { data } = await apiClient.post<SyncResponse>('/expenses/sync', body)
  return data
}

export async function syncChangesInChunks(
  changes: ChangeDto[],
  lastSyncTimestamp: string | null,
  onChunkSuccess?: (response: SyncResponse) => Promise<void>,
): Promise<SyncResponse> {
  const chunks = chunk(changes, SYNC_CHUNK_SIZE)

  if (chunks.length === 0) {
    const response = await syncChanges([], lastSyncTimestamp)
    await onChunkSuccess?.(response)
    return response
  }

  let lastResponse: SyncResponse = { applied: [], errors: [], expenses: [] }

  for (let index = 0; index < chunks.length; index += 1) {
    const isLast = index === chunks.length - 1
    lastResponse = await syncChanges(chunks[index]!, isLast ? lastSyncTimestamp : undefined)
    await onChunkSuccess?.(lastResponse)

    if (lastResponse.errors.length > 0) {
      break
    }
  }

  return lastResponse
}
