import type { APIGatewayProxyHandler } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET, createResponse } from '../../../../common';
import type { JwtPayload } from 'jsonwebtoken';
import { getUser } from '../../data/user';
import {
  InternalError,
  isCometError,
  responseAsCometError,
  UnauthorizedError,
} from '../../../../util/error';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import type { UserGetResponse } from 'globalmedia-comet';

export const userGetHandler: APIGatewayProxyHandler = async (event) => {
  const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
  try {
    const id = (jwt.verify(token, JWT_SECRET) as JwtPayload).aud as string;
    const result = await getUser(id);
    return createResponse<UserGetResponse>(200, {
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
