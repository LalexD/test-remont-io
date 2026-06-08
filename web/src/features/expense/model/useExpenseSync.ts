import { useConnection } from '@/features/connection'
import { useEffect } from 'react'
import { runExpenseSync } from '../sync/expenseSyncEngine'

export function useExpenseSync() {
  const { isBackendAvailable } = useConnection()

  useEffect(() => {
    if (!isBackendAvailable) return

    void runExpenseSync()
  }, [isBackendAvailable])
}
