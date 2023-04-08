import type { APIGatewayProxyHandler } from 'aws-lambda';
import type { User, UserUpdateResponse } from 'globalmedia-comet';
import { createResponse, JWT_SECRET } from '../../../../common';
import type { JwtPayload } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import { updateUser } from '../../data/user';
import {
  BadRequestError,
  InternalError,
  isCometError,
  responseAsCometError,
  UnauthorizedError,
} from '../../../../util/error';
import { assertAccessible } from '../../util/permission';

export const userUpdateHandler: APIGatewayProxyHandler = async (event) => {
  const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
  let data: User;
  try {
    data = JSON.parse(event.body) as User;
  } catch {
    return responseAsCometError(new BadRequestError('Data body is malformed JSON'));
  }
  if (!data || !data.userId) {
    return responseAsCometError(new BadRequestError('Wrong data body'));
  }
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return responseAsCometError(new UnauthorizedError('Malformed token'));
  }
  try {
    const id = payload.aud as string;
    await assertAccessible(id, token, 'admin');
    const result = await updateUser(data);
    return createResponse<UserUpdateResponse>(200, { success: true, result });
  } catch (e) {
    if (isCometError(e)) return responseAsCometError(e);
    console.error(e);
    return responseAsCometError(new InternalError());
  }
};
