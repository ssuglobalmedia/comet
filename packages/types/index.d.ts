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

export type RentStatus = {
  userId: string;
  userName: string;
  until: Date;
  additionalInfo?: string;
};

export type RentStatusDao = {
  uI: { S: string };
  uN: { S: string };
  u: { S: string };
  aI?: { S: string };
};

export type Goods = {
  id: string;
  name: string;
  category: string;
  rentStatus?: RentStatus;
};

export type GoodsDao = {
  n: { S: string };
  c: { S: string };
  rS?: { M: RentStatusDao };
};

export type GoodsMap = {
  goods: {
    [id: string]: Goods;
  };
};

export type GoodsMapDao = {
  g: { M: { [id: string]: GoodsDao } };
} & ModuleDao;

export type GoodsUpdateRequest = {
  id: string;
  name?: string;
  category?: string;
};
