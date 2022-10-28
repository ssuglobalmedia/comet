import type { Log } from 'mirinae-comet';
// eslint-disable-next-line import/extensions
import { dateSchema, fetchApi } from '$lib/api/common';
import { z } from 'zod';

const log = z.object({
  date: dateSchema,
  userId: z.string(),
  userName: z.string(),
  module: z.string(),
  target: z.string(),
  action: z.string(),
  data: z.string().optional(),
});

export const apiLogQuery = async () => fetchApi<Log[]>('/module/log/query', log);
