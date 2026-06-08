import { formatCurrency } from '@/shared/lib/formatCurrency'
import styles from './ExpenseTotal.module.css'

type ExpenseTotalProps = {
  total: number
}

export function ExpenseTotal({ total }: ExpenseTotalProps) {
  return (
    <p className={styles.total}>
      Итого: {formatCurrency(total)} у.е.
    </p>
  )
}
