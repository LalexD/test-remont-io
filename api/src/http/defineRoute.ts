import type { NextFunction, Request, Response, Router } from 'express';
import { z, type ZodType } from 'zod';
import { toHttpError } from './errors.js';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export type RouteHandler<TSchema extends ZodType | undefined = undefined> = (
  input: TSchema extends ZodType ? z.infer<TSchema> : Record<string, never>,
  res: Response,
) => Promise<void> | void;

export type DefinedRoute<TSchema extends ZodType | undefined = undefined> = {
  method: HttpMethod;
  path: string;
  schema?: TSchema;
  handler: RouteHandler<TSchema>;
};

function formatZodError(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (path && !(path in errors)) {
      errors[path] = issue.message;
    }
  }

  return errors;
}

function toRequestPayload(req: Request) {
  return {
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
  };
}

function parseRequest<TSchema extends ZodType>(
  schema: TSchema,
  req: Request,
):
  | { success: true; data: z.infer<TSchema> }
  | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(toRequestPayload(req));

  if (!result.success) {
    return { success: false, errors: formatZodError(result.error) };
  }

  return { success: true, data: result.data };
}

export function defineRoute<TSchema extends ZodType | undefined = undefined>(
  config: DefinedRoute<TSchema>,
): DefinedRoute<TSchema> {
  return config;
}

const emptyRequest = {} as Record<string, never>;

function createExpressHandler(route: DefinedRoute<ZodType | undefined>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!route.schema) {
        await route.handler(emptyRequest, res);
        return;
      }

      const parsed = parseRequest(route.schema, req);

      if (!parsed.success) {
        res.status(400).json({ errors: parsed.errors });
        return;
      }

      await route.handler(parsed.data, res);
    } catch (error) {
      next(toHttpError(error));
    }
  };
}

export function registerModuleRoutes(router: Router, routes: DefinedRoute<ZodType | undefined>[]): void {
  for (const route of routes) {
    router[route.method](route.path, createExpressHandler(route));
  }
}
