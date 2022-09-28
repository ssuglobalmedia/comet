import type { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponse } from '../../../common';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../../env';
import { JsonWebTokenError, JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import {
  CometError,
  InternalError,
  isCometError,
  responseAsCometError,
  UnauthorizedError,
} from '../../../util/error';
import { assertAccessible } from '../../auth/util/permission';
import { queryLogs } from '../data/log';

export const logQueryHandler: APIGatewayProxyHandler = async (event) => {
  const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
  try {
    const id = (jwt.verify(token, JWT_SECRET) as JwtPayload).aud as string;
    await assertAccessible(id, token, 'certificated');
    const result = await queryLogs();
    return createResponse(200, {
      success: true,
      result,
    });
  } catch (e) {
    if (isCometError(e)) return responseAsCometError(e);
    if (e instanceof JsonWebTokenError || e instanceof TokenExpiredError) {
      return responseAsCometError(new UnauthorizedError());
    }
    console.error(e);
    return responseAsCometError(new InternalError());
  }
};
