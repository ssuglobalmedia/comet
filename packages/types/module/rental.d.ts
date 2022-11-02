/* Rental Module */
import type {
  BadRequestError,
  CometResponse,
  ForbiddenError,
  InternalError,
  ModuleDao,
  UnauthorizedError,
  User,
} from '../index';

/* Data Objects */

export type RentStatus = {
  userId: string;
  userName: string;
  until: Date | string;
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

/* Requests */

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

export type GoodsRentRequest = {
  user: User;
  goodsId: string;
  until: string;
  additionalInfo?: string;
};

export type GoodsReturnRequest = {
  userId: string;
  goodsId: string;
};

/* Responses */

export type GoodsAddResponse = CometResponse<
  void,
  InternalError | BadRequestError | UnauthorizedError | ForbiddenError
>;

export type GoodsDeleteResponse = CometResponse<
  string,
  InternalError | BadRequestError | UnauthorizedError | ForbiddenError
>;

export type GoodsQueryResponse = CometResponse<
  Goods[],
  InternalError | UnauthorizedError | ForbiddenError
>;

export type GoodsRentResponse = CometResponse<
  boolean,
  InternalError | BadRequestError | UnauthorizedError | ForbiddenError
>;

export type GoodsReturnResponse = CometResponse<
  boolean,
  InternalError | BadRequestError | UnauthorizedError | ForbiddenError
>;

export type GoodsUpdateResponse = CometResponse<
  boolean,
  InternalError | BadRequestError | UnauthorizedError | ForbiddenError
>;
