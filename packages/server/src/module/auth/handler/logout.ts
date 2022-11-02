import type { APIGatewayProxyHandler } from 'aws-lambda';
import type { JwtPayload } from 'jsonwebtoken';
import { revokeToken } from '../data/token';
import { createResponse, JWT_SECRET } from '../../../common';
import * as jwt from 'jsonwebtoken';
import { responseAsCometError, UnauthorizedError } from '../../../util/error';
import type { LogoutResponse } from 'mirinae-comet';

export const logoutHandler: APIGatewayProxyHandler = async (event) => {
  const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const res = await revokeToken(payload.aud as string, token);
    return createResponse<LogoutResponse>(200, { success: true, result: res });
  } catch (err) {
    return responseAsCometError(new UnauthorizedError());
  }
};
