import { date, numeric, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey(),
  name: varchar('name', { length: 30 }).notNull(),
  sum: numeric('sum', { precision: 12, scale: 2 }).notNull(),
  date: date('date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true, mode: 'string' }),
});

export type ExpenseRecord = typeof expenses.$inferSelect;
export type NewExpenseRecord = typeof expenses.$inferInsert;
