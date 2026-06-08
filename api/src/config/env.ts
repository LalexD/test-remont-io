
import { getDatabaseUrl } from '@/db/utils/getDatabaseUrl.js';
import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: getDatabaseUrl(),
} as const;
