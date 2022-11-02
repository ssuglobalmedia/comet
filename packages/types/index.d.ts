/* Error types */
import type { CometError } from './error';

export * from './error';
export * from './module/auth';
export * from './module/log';
export * from './module/rental';
export type ModuleDao = {
  module: { S: string };
  dataId: { S: string };
};

export type CometResponse<T, E> = SuccessResponse<T> | ErrorResponse<E>;

export type SuccessResponse<T> = T extends void
  ? { success: true }
  : {
      success: true;
      result: T;
    };

export interface ErrorResponse<E extends CometError> {
  success: false;
  error: E;
}

/* Config Module */

export type WebhookType = 'teams';

export interface Config {
  rentalWebhook?: {
    url: string;
    type: WebhookType;
  };
  logFormat: {
    [moduleAction: string]: string;
  };
}

export type ConfigUpdateRequest = Partial<Config>;

export interface ConfigDao {
  rW?: {
    M: {
      u: { S: string };
      t: { S: WebhookType };
    };
  };
  lF: {
    M: {
      [moduleAction: string]: { S: string };
    };
  };
}
