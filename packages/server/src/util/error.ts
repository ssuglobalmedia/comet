import type { APIGatewayProxyResult } from 'aws-lambda';
import { createResponse } from '../common';

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

export function isCometError(error: unknown): error is CometError {
  return typeof error === 'object' && (error as CometError)?.isCometError;
}

export function errorResponse(error: CometError, overrideMessage?: string): APIGatewayProxyResult {
  return createResponse(error.code, {
    success: false,
    error: {
      code: error.code,
      name: error.name,
      message: overrideMessage ?? error.message,
      ...error.additionalInfo,
    },
  });
}

export function responseAsCometError(
  error: unknown,
  fallback: CometError = new InternalError(),
  additionalInfo: Record<string, unknown> = {},
) {
  if (isCometError(error)) {
    if (additionalInfo)
      error.additionalInfo = {
        ...error.additionalInfo,
        ...additionalInfo,
      };
    return errorResponse(error);
  }
  console.error(error);
  if (additionalInfo) fallback.additionalInfo = { ...fallback.additionalInfo, ...additionalInfo };
  return errorResponse(fallback);
}
