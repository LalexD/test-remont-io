import type { Express, Request, Response } from 'express';
import { expenseRouter } from '@/modules/expense/index.js';
import { checkDatabaseHealth } from '@/db/utils/checkDatabaseHealth.js';

export function registerRoutes(app: Express): void {
  app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Expense tracker API' });
  });

  app.get('/health', async (_req, res) => {
    const dbConnected = await checkDatabaseHealth();

    if (dbConnected) {
      return res.json({ status: 'ok' });
    }

    return res.status(503).json({ status: 'error' });
  });

  app.use('/expenses', expenseRouter);
}
