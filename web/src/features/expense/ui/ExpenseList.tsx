import type { Expense } from '../model/types'
import { ExpenseItem } from './ExpenseItem'
import styles from './ExpenseList.module.css'

type ExpenseListProps = {
  expenses: Expense[]
  onDelete: (id: string) => void | Promise<void>
}

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  if (expenses.length === 0) {
    return <p className={styles.empty}>Статей расходов пока нет</p>
  }

  return (
    <ul className={styles.list}>
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onDelete={() => onDelete(expense.id)}
        />
      ))}
    </ul>
  )
}
