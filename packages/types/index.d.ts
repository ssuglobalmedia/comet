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
  phone?: string;
};
