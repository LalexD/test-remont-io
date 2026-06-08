import type { ErrorRequestHandler } from 'express';
import { toHttpError } from './errors.js';

export const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const httpError = toHttpError(error);

  console.error('Request error:', error);

  res.status(httpError.statusCode).json({ message: httpError.message });
};
