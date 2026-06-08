import { z } from 'zod'

export const createExpenseFormSchema = z.object({
  name: z
    .string({ error: 'Название обязательно' })
    .trim()
    .min(3, 'Название должно быть от 3 до 30 символов')
    .max(30, 'Название должно быть от 3 до 30 символов'),
  sum: z.coerce
    .number({ error: 'Сумма обязательна' })
    .min(1, 'Сумма должна быть от 1.00 до 1 000 000.00')
    .max(1_000_000, 'Сумма должна быть от 1.00 до 1 000 000.00'),
  date: z.string({ error: 'Дата обязательна' }).min(1, 'Дата обязательна'),
})

export type CreateExpenseFormInput = z.input<typeof createExpenseFormSchema>
export type CreateExpenseFormValues = z.infer<typeof createExpenseFormSchema>
