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
