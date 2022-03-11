/* Response */
export type CometResponse = {
  success: boolean;
  // eslint-disable-next-line
  result?: any;
  error?: number;
  error_description?: string;
};

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
