/* Config Module */

export type WebhookType = 'teams';

export interface Config {
  rentalWebhook?: {
    url: string;
    type: WebhookType;
    actions: string[];
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
      a: { SS: string[] };
    };
  };
  lF: {
    M: {
      [moduleAction: string]: { S: string };
    };
  };
}
