import 'dotenv/config';

export function getDatabaseUrl(): string {
  const host = process.env.DATABASE_HOST ?? 'localhost';
  const port = process.env.DATABASE_PORT ?? '5432';
  const user = process.env.DATABASE_USER ?? 'remont';
  const password = process.env.DATABASE_PASSWORD ?? 'remont';
  const database = process.env.DATABASE_NAME ?? 'remont';

  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}
