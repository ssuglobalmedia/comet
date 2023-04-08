import type { APIGatewayProxyHandler } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { createResponse, JWT_SECRET } from '../../../../common';
import {
  BadRequestError,
  InternalError,
  isCometError,
  responseAsCometError,
  UnauthorizedError,
} from '../../../../util/error';
import { assertAccessible } from '../../util/permission';
import { batchDeleteUser } from '../../data/user';
import type { UserBatchDeleteResponse } from 'globalmedia-comet';

export const userBatchDeleteHandler: APIGatewayProxyHandler = async (event) => {
  const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
  let data: string[];
  try {
    data = JSON.parse(event.body) as string[];
  } catch {
    return responseAsCometError(new BadRequestError('Data is malformed JSON'));
  }
  if (!data || !Array.isArray(data)) {
    return responseAsCometError(new BadRequestError('Wrong data body'));
  }
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return responseAsCometError(new UnauthorizedError('Malformed token'));
  }
  let i = 0;
  try {
    const id = payload.aud as string;
    await assertAccessible(id, token, 'admin');
    for (i = 0; i < data.length; i += 25) {
      const partialData = data.slice(i, i + 25);
      await batchDeleteUser(partialData);
    }
    return createResponse<UserBatchDeleteResponse>(200, { success: true });
  } catch (e) {
    if (isCometError(e)) {
      e.additionalInfo.failed_data = data.slice(i, data.length);
      return responseAsCometError(e);
    }
    console.error(e);
    const internalError = new InternalError();
    internalError.additionalInfo.failed_data = data.slice(i, data.length);
    return responseAsCometError(internalError);
  }
};
