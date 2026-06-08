import { z, type ZodObject, type ZodRawShape, type ZodType } from 'zod';

type RequestPartSchema = ZodObject<ZodRawShape>;

export type RequestSchemaParts = {
  body?: RequestPartSchema;
  query?: RequestPartSchema;
  params?: RequestPartSchema;
  headers?: RequestPartSchema;
};

type StrictPart<T extends RequestPartSchema> = ReturnType<T['strict']>;

type RequestSchemaShape<T extends RequestSchemaParts> = {
  [K in keyof T]-?: K extends keyof RequestSchemaParts ? StrictPart<NonNullable<T[K]>> : never;
};

export function defineRequestSchema<const T extends RequestSchemaParts>(parts: T) {
  return z.object({
    ...(parts.body !== undefined ? { body: parts.body.strict() } : {}),
    ...(parts.query !== undefined ? { query: parts.query.strict() } : {}),
    ...(parts.params !== undefined ? { params: parts.params.strict() } : {}),
    ...(parts.headers !== undefined ? { headers: parts.headers.strict() } : {}),
  }) as ZodObject<RequestSchemaShape<T>>;
}
