import type { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponse, JWT_SECRET } from '../../../common';
import type { JwtPayload } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import { assertAccessible } from '../../auth/util/permission';
import {
  BadRequestError,
  InternalError,
  responseAsCometError,
  UnauthorizedError,
} from '../../../util/error';
import type { ConfigUpdateRequest } from 'mirinae-comet';
import { updateConfig } from '../data/config';

export const configUpdateHandler: APIGatewayProxyHandler = async (event) => {
  const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
  let data: ConfigUpdateRequest;
  try {
    data = JSON.parse(event.body) as ConfigUpdateRequest;
  } catch {
    return responseAsCometError(new BadRequestError('Data body is malformed JSON'));
  }
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return responseAsCometError(new UnauthorizedError());
  }
  try {
    const id = payload.aud as string;
    await assertAccessible(id, token, 'executive');
    const res = await updateConfig(data);
    return createResponse(200, { success: res });
  } catch (e) {
    console.error(e);
    return responseAsCometError(new InternalError());
  }
};
