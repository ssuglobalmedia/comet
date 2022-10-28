import type {
  CallbackResponse,
  LogoutResponse,
  RevokedTokenInfo,
  TokenInfo,
  User,
  UserBatchDeleteResponse,
  UserBatchPutResponse,
  UserGetResponse,
  UserQueryResponse,
  UserUpdateRequest,
  UserUpdateResponse,
} from 'mirinae-comet';
import { z } from 'zod';
// eslint-disable-next-line import/extensions
// eslint-disable-next-line import/extensions
import { fetchApi } from '$lib/api/common';
import type { ClientResponse } from '../../../global';

const user = z.object({
  userId: z.string().regex(/^\d+$/),
  userName: z.string(),
  userGroup: z.string(),
  lastSemester: z.number().optional(),
  phone: z.string().optional(),
});

const userUpdateRequest = user.partial({
  userName: true,
  userGroup: true,
});

const tokenInfo = z.object({
  id: z.string(),
  accessToken: z.string(),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number(),
});

const revokedTokenInfo = z.object({
  accessToken: z.string(),
});

export const apiCallback = async (result: string): Promise<ClientResponse<CallbackResponse>> =>
  fetchApi<TokenInfo>('/module/auth/callback?result=' + encodeURIComponent(result), tokenInfo);

export const apiLogout = async (): Promise<ClientResponse<LogoutResponse>> =>
  fetchApi<RevokedTokenInfo>('/module/auth/logout', revokedTokenInfo);

export const apiUserGet = async (): Promise<ClientResponse<UserGetResponse>> =>
  fetchApi<User>('/module/auth/user/get', user);

export const apiUserQuery = async (
  starts: string = undefined,
): Promise<ClientResponse<UserQueryResponse>> =>
  fetchApi<User[]>(`/module/auth/user/query${starts ? '?starts=' + starts : ''}`, z.array(user));

export const apiUserUpdate = async (
  data: UserUpdateRequest,
): Promise<ClientResponse<UserUpdateResponse>> =>
  fetchApi<UserUpdateRequest>('/module/auth/user/update', userUpdateRequest, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const apiUserBatchDelete = async (
  data: string[],
): Promise<ClientResponse<UserBatchDeleteResponse>> =>
  fetchApi<void>('/module/auth/user/batch/delete', z.any().optional(), {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const apiUserBatchPut = async (
  data: User[],
): Promise<ClientResponse<UserBatchPutResponse>> =>
  fetchApi<void>('/module/auth/user/batch/put', z.any().optional(), {
    method: 'POST',
    body: JSON.stringify(data),
  });
