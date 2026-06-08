import { z } from 'zod';
import { defineRequestSchema } from '@/http/requestSchema.js';

export const expenseItemSchema = z.object({
  name: z
    .string({ error: 'Название обязательно' })
    .min(3, 'Название должно быть от 3 до 30 символов')
    .max(30, 'Название должно быть от 3 до 30 символов'),
  sum: z
    .number({ error: 'Сумма обязательна' })
    .min(1, 'Сумма должна быть от 1.00 до 1 000 000.00')
    .max(1_000_000, 'Сумма должна быть от 1.00 до 1 000 000.00'),
  date: z.string({ error: 'Дата обязательна' }).min(1, 'Дата обязательна'),
});

const changeOpSchema = z.discriminatedUnion('op', [
  z.object({
    op: z.literal('create'),
    id: z.uuid({ error: 'Некорректный идентификатор' }),
    data: expenseItemSchema,
  }),
  z.object({
    op: z.literal('delete'),
    id: z.uuid({ error: 'Некорректный идентификатор' }),
  }),
]);

export const syncChangesRequestSchema = defineRequestSchema({
  body: z.object({
    changes: z
      .array(changeOpSchema, { error: 'Список изменений обязателен' })
      .max(100, 'За один запрос можно синхронизировать не более 100 изменений'),
    lastSyncTimestamp: z.iso
      .datetime({ offset: true })
      .nullable()
      .optional(),
  }),
});

export type SyncChangesRequest = z.infer<typeof syncChangesRequestSchema>;
export type SyncChangesBody = SyncChangesRequest['body'];
export type ExpenseItem = z.infer<typeof expenseItemSchema>;
export type ChangeOp = 'create' | 'delete';
