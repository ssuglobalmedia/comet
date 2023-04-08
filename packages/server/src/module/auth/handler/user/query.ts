import type { APIGatewayProxyHandler } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET, createResponse } from '../../../../common';
import type { JwtPayload } from 'jsonwebtoken';
import { queryUser } from '../../data/user';
import { InternalError, isCometError, responseAsCometError } from '../../../../util/error';
import { assertAccessible } from '../../util/permission';
import type { UserQueryResponse } from 'globalmedia-comet';

export const userQueryHandler: APIGatewayProxyHandler = async (event) => {
  const startsWith = event.queryStringParameters?.starts ?? '';
  const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
  try {
    const id = (jwt.verify(token, JWT_SECRET) as JwtPayload).aud as string;
    await assertAccessible(id, token, 'executive');
    const result = await queryUser(startsWith);
    return createResponse<UserQueryResponse>(200, {
      success: true,
      result,
    });
  } catch (e) {
    if (isCometError(e)) return responseAsCometError(e);
    console.error(e);
    return responseAsCometError(new InternalError());
  }
};
