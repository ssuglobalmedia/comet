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
  until: Date;
  amount: number;
  additionalInfo: string;
};

export type RentStatusDao = {
  uI: { S: string };
  u: { S: string };
  a: { N: string };
  aI: { S: string };
};

export type Goods = {
  name: string;
  category: string;
  amount: number;
  rentStatus: RentStatus[];
};

export type GoodsDao = {
  n: { S: string };
  c: { S: string };
  a: { N: string };
  rS: RentStatusDao[];
};

export type GoodsListDao = {
  g: GoodsDao[];
} & ModuleDao;
