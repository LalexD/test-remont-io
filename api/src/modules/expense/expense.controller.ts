import type { RouteHandler } from '@/http/defineRoute.js';
import { syncChangesRequestSchema } from './expense.schema.js';
import * as expenseService from './expense.service.js';

export const sync: RouteHandler<typeof syncChangesRequestSchema> = async ({ body }, res) => {
  const result = await expenseService.syncExpenses(body);
  res.status(200).json(result);
};
