// eslint-disable-next-line import/extensions
import { getAuthorization } from '$lib/module/auth';
import type { ZodTypeAny } from 'zod';
import { z } from 'zod';
// eslint-disable-next-line import/extensions
import { variables } from '$lib/variables';
// eslint-disable-next-line import/extensions
import { BadResponseError, CometError, cometError, FetchError, isCometError } from '$lib/api/error';
import type { CometResponse, ErrorResponse, SuccessResponse } from 'mirinae-comet';

export const dateSchema = z.preprocess((arg) => {
  if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
}, z.date());

export const createSuccessResponse = (schema: Zod.ZodTypeAny = z.any().optional()) =>
  z
    .object({
      success: z.literal(true),
    })
    .extend({
      result: schema,
    })
    .passthrough();

export const createErrorResponse = (schema: ZodTypeAny = cometError) =>
  z
    .object({
      success: z.literal(false),
    })
    .extend({
      error: schema,
    })
    .passthrough();

export const fetchWithAuth = (resource: RequestInfo, init?: RequestInit) =>
  getAuthorization()
    ? fetch(resource, {
        ...init,
        headers: {
          Authorization: `Bearer ${getAuthorization()}`,
          ...init?.headers,
        },
      })
    : fetch(resource, init);

export async function fetchApi<T>(
  apiPath: string,
  responseSchema: ZodTypeAny,
  init?: RequestInit,
): Promise<CometResponse<T, CometError>> {
  const response = await fetchWithAuth(`${variables.baseUrl}/api${apiPath}`, init)
    .then((res) => res.json())
    .then((responseData) => {
      if (typeof responseData.success === 'boolean') {
        return responseData;
      }
      return new BadResponseError('Response is not standard comet response', {
        response: responseData,
      });
    })
    .catch((err) => {
      return new FetchError('', err);
    });
  if (isCometError(response)) {
    return {
      success: false,
      error: response,
    };
  }
  const successResponse = createSuccessResponse(responseSchema);
  const errorResponse = createErrorResponse();
  const parseResult = successResponse.safeParse(response);
  if (parseResult.success) {
    return parseResult.data as SuccessResponse<T>;
  } else {
    const errorParseResult = errorResponse.safeParse(response);
    if (errorParseResult.success) {
      return errorParseResult.data as ErrorResponse<CometError>;
    } else if (errorParseResult.success === false) {
      if (parseResult.success === false) console.error('On success:', parseResult.error);
      console.error('On error:', errorParseResult.error);
    }
    return {
      success: false,
      error: new BadResponseError(response),
    };
  }
}
