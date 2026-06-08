import type { ChangeOp, ExpenseItem } from './expense.schema.js';

export type ExpenseDto = {
  id: string;
  name: string;
  sum: number;
  date: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type ChangeDto =
  | { op: 'create'; id: string; data: ExpenseItem }
  | { op: 'delete'; id: string };

export type SyncError = {
  id: string;
  op: ChangeOp;
  message: string;
};

export type SyncResponse = {
  applied: string[];
  errors: SyncError[];
  expenses: ExpenseDto[];
  serverTimestamp?: string;
};
