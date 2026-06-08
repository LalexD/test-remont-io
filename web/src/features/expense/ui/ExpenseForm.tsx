import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/ui/Button/Button'
import { Input } from '@/shared/ui/Input/Input'
import {
  createExpenseFormSchema,
  type CreateExpenseFormInput,
  type CreateExpenseFormValues,
} from '../model/createExpenseForm.schema'
import styles from './ExpenseForm.module.css'

type ExpenseFormProps = {
  onSubmit: (data: CreateExpenseFormValues) => void | Promise<void>
}

const defaultValues: CreateExpenseFormInput = {
  name: '',
  sum: '',
  date: new Date().toISOString().slice(0, 10),
}

export function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateExpenseFormInput, unknown, CreateExpenseFormValues>({
    resolver: zodResolver(createExpenseFormSchema),
    mode: 'onBlur',
    defaultValues,
  })

  const submit = handleSubmit(async (data) => {
    await onSubmit(data)
    reset({
      ...defaultValues,
      date: new Date().toISOString().slice(0, 10),
    })
  })

  return (
    <form className={styles.expenseForm} onSubmit={submit} noValidate>
      <Input
        label="Название"
        error={errors.name?.message}
        {...register('name')}
      />
      <Input
        label="Сумма"
        type="number"
        step="0.01"
        error={errors.sum?.message}
        {...register('sum')}
      />
      <Input
        label="Дата"
        type="date"
        error={errors.date?.message}
        {...register('date')}
      />
      <Button type="submit" disabled={isSubmitting}>
        Добавить
      </Button>
    </form>
  )
}
