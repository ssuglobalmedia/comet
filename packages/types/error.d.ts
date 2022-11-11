/* Error */
export interface CometError {
  code: number;
  name: string;
  message?: string;
  additionalInfo?: Record<string, unknown>;
}

export type BadRequestError = CometError & {
  code: 400;
  name: 'BadRequest';
};

export type UnauthorizedError = CometError & {
  code: 401;
  name: 'Unauthorized';
};

export type ForbiddenError = CometError & {
  code: 403;
  name: 'Forbidden';
};

export type NotFoundError = CometError & {
  code: 404;
  name: 'NotFound';
};

export type InternalError = CometError & {
  code: 500;
  name: 'InternalError';
};
