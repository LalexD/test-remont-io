import { useConnection } from '../model/ConnectionProvider'
import styles from './ConnectionStatus.module.css'

const STATUS_LABELS = {
  online: 'Онлайн · сервер доступен',
  offline: 'Офлайн · данные сохраняются локально',
  'backend-down': 'Сеть есть · сервер недоступен',
} as const

const STATUS_CLASS = {
  online: styles.online,
  offline: styles.offline,
  'backend-down': styles.backendDown,
} as const

type ConnectionStatusProps = {
  pendingCount?: number
}

export function ConnectionStatus({ pendingCount = 0 }: ConnectionStatusProps) {
  const { status } = useConnection()

  const pendingLabel =
    pendingCount > 0 ? ` · ${pendingCount} ожидают синхронизации` : ''

  return (
    <div className={`${styles.status} ${STATUS_CLASS[status]}`}>
      <span className={styles.dot} />
      <span>
        {STATUS_LABELS[status]}
        {pendingLabel}
      </span>
    </div>
  )
}
