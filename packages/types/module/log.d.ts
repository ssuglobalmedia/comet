/* Log Module */
import type {
  CometResponse,
  ForbiddenError,
  InternalError,
  ModuleDao,
  UnauthorizedError,
} from '../index';

export type Log = {
  date: Date | string;
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

export type LogQueryResponse = CometResponse<
  Log[],
  InternalError | UnauthorizedError | ForbiddenError
>;

export type TeamsWebhookFact = {
  name: string;
  value: string;
};

export interface TeamsWebhookAction {
  "@type": string;
  name: string;
}

export interface TeamsWebhookActionOpenUri extends TeamsWebhookAction {
  "@type": "OpenUri";
  targets: { os: string; uri: string; }[];
}

export type WebhookMessage = {
  userName: string;
  module: string;
  action: string;
  date: Date;
  target: string;
  description: string;
  openUri: { name: string; uri: string; };
}
