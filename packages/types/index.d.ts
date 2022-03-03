/* Response */
export type CometResponse = {
  success: boolean;
  result?: any;
  error?: number;
  error_description?: string;
};

/* Module */

export type ModuleData = {
  module: string;
  dataId: string;
};

/* Auth Module */
export type UserInfoData = ModuleData & UserInfoData;

export type UserInfo = {
  userId: string;
  userName: string;
  userGroup: string;
  lastSemester?: string;
  phone?: string;
};
