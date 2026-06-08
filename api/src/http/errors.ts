const CONNECTION_ERROR_CODES = new Set(['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET']);

export class AppError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'База данных недоступна') {
    super(message, 503);
    this.name = 'DatabaseError';
  }
}

function hasErrorCode(error: unknown): error is { code: string } {
  return typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string';
}

function isConnectionMessage(message: string): boolean {
  const normalized = message.toLowerCase();

  return (
    normalized.includes('connection terminated') ||
    normalized.includes('connection refused') ||
    normalized.includes('connect econnrefused') ||
    normalized.includes('timeout') ||
    (normalized.includes('database') && normalized.includes('unavailable'))
  );
}

export function isDatabaseError(error: unknown): boolean {
  if (error instanceof DatabaseError) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  if (hasErrorCode(error) && CONNECTION_ERROR_CODES.has(error.code)) {
    return true;
  }

  return isConnectionMessage(error.message);
}

export function toHttpError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (isDatabaseError(error)) {
    return new DatabaseError();
  }

  if (error instanceof Error) {
    return new AppError('Внутренняя ошибка сервера', 500);
  }

  return new AppError('Внутренняя ошибка сервера', 500);
}
