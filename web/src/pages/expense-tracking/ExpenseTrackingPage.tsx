import {
  ExpenseForm,
  ExpenseList,
  ExpenseTotal,
  useExpenses,
  useExpenseSync,
  type CreateExpenseDto,
} from '@/features/expense'
import { ConnectionStatus } from '@/features/connection'
import styles from './ExpenseTrackingPage.module.css'

export default function ExpenseTrackingPage() {
  const { expenses, total, pendingCount, addExpense, removeExpense } = useExpenses()

  useExpenseSync()

  const handleSubmit = async (data: CreateExpenseDto) => {
    await addExpense(data)
  }

  const handleGenerateTestExpenses = async () => {
    const names = ['Продукты', 'Транспорт', 'Кафе', 'ЖКХ', 'Здоровье', 'Одежда', 'Связь', 'Развлечения']

    for (let index = 0; index < 10; index += 1) {
      const data: CreateExpenseDto = {
        name: `${names[index % names.length]} ${index + 1}`.slice(0, 30),
        sum: Math.floor(Math.random() * 999) + 1,
        date: new Date(Date.now() - Math.floor(Math.random() * 86_400_000))
          .toISOString()
          .slice(0, 10),
      }

      await addExpense(data)
    }
  }

  const handleDelete = (id: string) => {
    void removeExpense(id)
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>Трекер расходов</h1>
        <ConnectionStatus pendingCount={pendingCount} />
      </header>

      <div className={styles.content}>
        <section>
          <h2>Новая запись</h2>
          <ExpenseForm onSubmit={handleSubmit} />
          <button
            type="button"
            className={styles.testButton}
            onClick={() => void handleGenerateTestExpenses()}
          >
            Сгенерировать 10 случайных записей
          </button>
        </section>

        <section>
          <h2>Список расходов</h2>
          <ExpenseList expenses={expenses} onDelete={handleDelete} />
          <ExpenseTotal total={total} />
        </section>
      </div>
    </main>
  )
}
