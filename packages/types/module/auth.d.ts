/* Auth Module */
import type {
  BadRequestError,
  CometResponse,
  ForbiddenError,
  InternalError,
  ModuleDao,
  UnauthorizedError,
} from '../index';

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

export type TokenInfo = {
  id: string;
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
};

export type RevokedTokenInfo = {
  accessToken: string;
};

export type UserUpdateRequest = {
  userId: string;
  userName?: string;
  userGroup?: string;
  lastSemester?: string;
  phone?: string;
};

export type UserGetResponse = CometResponse<User, InternalError | UnauthorizedError>;

export type UserQueryResponse = CometResponse<
  User[],
  InternalError | UnauthorizedError | ForbiddenError
>;

export type UserUpdateResponse = CometResponse<
  UserUpdateRequest,
  InternalError | UnauthorizedError | ForbiddenError | BadRequestError
>;

export type UserBatchDeleteResponse = CometResponse<
  void,
  InternalError | UnauthorizedError | ForbiddenError | BadRequestError
>;

export type UserBatchPutResponse = CometResponse<
  void,
  InternalError | UnauthorizedError | ForbiddenError | BadRequestError
>;

export type CallbackResponse = CometResponse<TokenInfo, InternalError | UnauthorizedError>;

export type LogoutResponse = CometResponse<RevokedTokenInfo, InternalError | UnauthorizedError>;
