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

export type NotFoundError = CometError & {
  code: 404;
  name: 'NotFound';
};

export type InternalError = CometError & {
  code: 500;
  name: 'InternalError';
};

/* Response */
export type CometResponse<T, E> = SuccessResponse<T> | ErrorResponse<E>;

export interface SuccessResponse<T> extends CometResponse {
  success: true;
  result: T;
}

export interface ErrorResponse<E extends CometError> extends CometResponse {
  success: false;
  error: E;
}

/* Module */

export type ModuleDao = {
  module: { S: string };
  dataId: { S: string };
};

/* Auth Module */
export type UserDao = {
  userName: { S: string };
  userGroup: { S: string };
  lastSemester?: { N: string };
  phone?: { S: string };
} & ModuleDao;

export type User = {
  userId: string;
  userName: string;
  userGroup: string;
  lastSemester?: string;
  phone?: string;
};

/* Rental Module */

export type RentStatus = {
  userId: string;
  userName: string;
  until: Date;
  additionalInfo?: string;
  announced?: boolean;
};

export type RentStatusDao = {
  uI: { S: string };
  uN: { S: string };
  u: { S: string };
  aI?: { S: string };
  a?: { BOOL: boolean };
};

export type Goods = {
  id: string;
  name: string;
  category: string;
  permission: string;
  location: string;
  rentStatus?: RentStatus;
};

export type GoodsDao = {
  n: { S: string };
  c: { S: string };
  p: { N: string };
  l: { S: string };
  rS?: { M: RentStatusDao };
} & ModuleDao;

export type GoodsUpdateRequest = {
  id: string;
  name?: string;
  category?: string;
  location?: string;
  permission?: string;
};

export type GoodsDeleteRequest = {
  id: string;
};

/* Log Module */

export type Log = {
  date: string;
  userId: string;
  userName: string;
  module: string;
  target: string;
  action: string;
  data?: string;
};

export type LogDao = {
  uI: { S: string };
  uN: { S: string };
  m: { S: string };
  t: { S: string };
  a: { S: string };
  d?: { S: string };
} & ModuleDao;

/* Config Module */

export interface Config {
  rentalWebhook: {
    url: string;
    type: 'teams';
  };
  logFormat: {
    [module: string]: {
      [action: string]: string;
    }
  }
}

export type ConfigUpdateRequest = Optional<Config>;

export interface ConfigDao {
  rW: { M: {
    u: { S: string; };
    t: { S: string; };
  }};
  lF: { M: {
    [module: string]: { M: {
        [action: string]: { S: string };
      }};
  }};
}
