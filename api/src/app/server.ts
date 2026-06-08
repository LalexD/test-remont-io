import cors from 'cors';
import express from 'express';
import type { Server } from 'node:http';
import { registerRoutes } from '@/app/routes.js';
import { env } from '@/config/env.js';
import { checkDbConnection, closeDb } from '@/db/client.js';
import { errorHandler } from '@/http/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  registerRoutes(app);
  app.use(errorHandler);

  return app;
}

export async function startServer(): Promise<Server> {
  try {
    await checkDbConnection();
    console.log('Database connection established');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }

  const app = createApp();

  const server = app.listen(env.port, () => {
    console.log(`Server is running on http://localhost:${env.port}`);
  });

  async function shutdown(): Promise<void> {
    server.close();
    await closeDb();
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return server;
}
