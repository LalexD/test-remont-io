import { Router } from 'express';
import { defineRoute, registerModuleRoutes } from '@/http/defineRoute.js';
import * as expenseController from './expense.controller.js';
import { syncChangesRequestSchema } from './expense.schema.js';

const routes = [
  defineRoute({
    method: 'post',
    path: '/sync',
    schema: syncChangesRequestSchema,
    handler: expenseController.sync,
  }),
];

export const expenseRouter = Router();

registerModuleRoutes(expenseRouter, routes);
