import { z } from 'zod';
// eslint-disable-next-line import/extensions
import { fetchApi } from '$lib/api/common';
import type { Config, ConfigUpdateRequest } from 'mirinae-comet';

const config = z.object({
  rentalWebhook: z
    .object({
      url: z.string(),
      type: z.enum(['teams']),
    })
    .optional(),
  logFormat: z.record(z.string(), z.string()).default({}).optional(),
});

export const apiConfigGet = async () => fetchApi<Config>('/module/config/get', config);

export const apiConfigUpdate = async (data: ConfigUpdateRequest) =>
  fetchApi<void>('/module/config/update', z.any().optional(), {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
