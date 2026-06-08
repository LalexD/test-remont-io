import { ConnectionProvider } from '@/features/connection'
import { db } from '@/shared/db/database'
import { useEffect, useState, type ReactNode } from 'react'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const [isDbReady, setIsDbReady] = useState(false)

  useEffect(() => {
    void db.open().then(() => setIsDbReady(true))
  }, [])

  if (!isDbReady) {
    return <p>Загрузка локальной базы данных…</p>
  }

  return <ConnectionProvider>{children}</ConnectionProvider>
}
