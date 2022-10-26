// eslint-disable-next-line import/extensions
import { getAuthorization } from '$lib/module/auth';
import type { ZodTypeAny } from 'zod';
import { z } from 'zod';

export const createSuccessResponse = (schema: Zod.ZodTypeAny = z.any().optional()) =>
  z
    .object({
      success: z.literal(true),
    })
    .extend({
      result: schema,
    })
    .passthrough();

export const cometError = z.object({
  code: z.number().int(),
  name: z.string(),
  message: z.string().optional(),
  additionalInfo: z.object({}).passthrough().optional(),
});

export const badRequestError = cometError.extend({
  code: z.literal(400),
  name: z.literal('BadRequest'),
});

export const unauthorizedError = cometError.extend({
  code: z.literal(401),
  name: z.literal('Unauthorized'),
});

export const notFoundError = cometError.extend({
  code: z.literal(404),
  name: z.literal('NotFound'),
});

export const internalError = cometError.extend({
  code: z.literal(500),
  name: z.literal('InternalError'),
});

export const createErrorResponse = (schema: ZodTypeAny = z.any().optional()) =>
  z
    .object({
      success: z.literal(false),
    })
    .extend({
      error: schema,
    })
    .passthrough();

export const fetchWithAuth = (resource: RequestInfo, init?: RequestInit) =>
  fetch(resource, {
    ...init,
    headers: {
      Authorization: `Bearer ${getAuthorization()}`,
      ...init?.headers,
    },
  });
