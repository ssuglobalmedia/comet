import type { APIGatewayProxyHandler } from 'aws-lambda';
import { JWT_SECRET } from '../../../env';
import type { JwtPayload } from 'jsonwebtoken';
import { revokeToken } from '../data/token';
import { createResponse } from '../../../common';
import * as jwt from 'jsonwebtoken';
import { responseAsCometError, UnauthorizedError } from '../../../util/error';

export const logoutHandler: APIGatewayProxyHandler = async (event) => {
  const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const res = await revokeToken(payload.aud as string, token);
    return createResponse(200, { success: true, ...res });
  } catch (err) {
    return responseAsCometError(new UnauthorizedError());
  }
};
