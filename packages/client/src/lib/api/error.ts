import { z } from 'zod';

export class CometError extends Error {
  isCometError: true;

  message: string;

  code: number;

  additionalInfo: Record<string, unknown>;

  name: string;

  constructor(
    code: number,
    name: string,
    message?: string,
    additionalInfo?: Record<string, unknown>,
  ) {
    super(message);
    this.code = code;
    this.name = name;
    this.message = message;
    this.additionalInfo = additionalInfo;
    this.isCometError = true;
  }
}

export class BadRequestError extends CometError {
  constructor(message?: string, additionalInfo?: Record<string, unknown>) {
    super(400, 'BadRequest', message, additionalInfo);
  }
}

export class UnauthorizedError extends CometError {
  constructor(message?: string, additionalInfo?: Record<string, unknown>) {
    super(401, 'Unauthorized', message, additionalInfo);
  }
}

export class ForbiddenError extends CometError {
  constructor(message?: string, additionalInfo?: Record<string, unknown>) {
    super(403, 'Forbidden', message, additionalInfo);
  }
}

export class NotFoundError extends CometError {
  constructor(message?: string, additionalInfo?: Record<string, unknown>) {
    super(404, 'NotFound', message, additionalInfo);
  }
}

export class InternalError extends CometError {
  constructor(message?: string, additionalInfo?: Record<string, unknown>) {
    super(500, 'InternalError', message, additionalInfo);
  }
}

export class BadResponseError extends CometError {
  constructor(message?: string, additionalInfo?: Record<string, unknown>) {
    super(500, 'BadResponse', message, additionalInfo);
  }
}

export class FetchError extends CometError {
  constructor(message?: string, additionalInfo?: Record<string, unknown>) {
    super(500, 'FetchError', message, additionalInfo);
  }
}

export const cometError = z
  .object({
    code: z.number().int(),
    name: z.string(),
    message: z.string().optional(),
    additionalInfo: z.object({}).passthrough().optional(),
  })
  .passthrough();

export function isCometError(error: unknown): error is CometError {
  return typeof error === 'object' && (error as CometError)?.isCometError;
}
