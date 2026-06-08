import { Button } from '@/shared/ui/Button/Button'
import { formatCurrency } from '@/shared/lib/formatCurrency'
import { formatDate } from '@/shared/lib/formatDate'
import type { Expense } from '../model/types'
import styles from './ExpenseItem.module.css'

type ExpenseItemProps = {
  expense: Expense
  onDelete: () => void | Promise<void>
}

const SYNC_STATUS_LABELS = {
  pending: 'Ожидает синхронизации',
  failed: 'Ошибка синхронизации',
  synced: '',
} as const

export function ExpenseItem({ expense, onDelete }: ExpenseItemProps) {
  const syncLabel = SYNC_STATUS_LABELS[expense.syncStatus]

  return (
    <li className={styles.item}>
      <div className={styles.info}>
        <span className={styles.name}>{expense.name}</span>
        <span className={styles.meta}>
          {formatCurrency(expense.sum)} · {formatDate(expense.date)}
          {syncLabel ? ` · ${syncLabel}` : ''}
        </span>
      </div>
      <Button
        type="button"
        variant="secondary"
        className={styles.deleteButton}
        onClick={() => void onDelete()}
      >
        Удалить
      </Button>
    </li>
  )
}
