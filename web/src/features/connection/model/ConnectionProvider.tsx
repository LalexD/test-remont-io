import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { checkBackendHealth } from '../api/healthCheck'
import type { ConnectionState } from './types'

const CHECK_INTERVAL_MS = 60 * 1000

export type ConnectionContextValue = {
  status: ConnectionState
  isOnline: boolean
  isBackendAvailable: boolean
}

const ConnectionContext = createContext<ConnectionContextValue | null>(null)

type ConnectionProviderProps = {
  children: ReactNode
}

export function ConnectionProvider({ children }: ConnectionProviderProps) {
  const [status, setStatus] = useState<ConnectionState>(
    navigator.onLine ? 'online' : 'offline',
  )

  useEffect(() => {
    const updateStatus = async () => {
      if (!navigator.onLine) {
        setStatus('offline')
        return
      }

      const isBackendAvailable = await checkBackendHealth()
      setStatus(isBackendAvailable ? 'online' : 'backend-down')
    }

    void updateStatus()

    const handleOnline = () => void updateStatus()
    const handleOffline = () => setStatus('offline')
    const intervalId = window.setInterval(() => void updateStatus(), CHECK_INTERVAL_MS)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.clearInterval(intervalId)
    }
  }, [])

  const value = useMemo<ConnectionContextValue>(
    () => ({
      status,
      isOnline: status === 'online',
      isBackendAvailable: status === 'online',
    }),
    [status],
  )

  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>
}

export function useConnection(): ConnectionContextValue {
  const context = useContext(ConnectionContext)

  if (!context) {
    throw new Error('useConnection must be used within ConnectionProvider')
  }

  return context
}
