import type { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponse } from '../../../common';
import type { JwtPayload } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../../env';
import { assertAccessible } from '../../auth/util/permission';
import { updateGoods } from '../data/rental';
import {
  BadRequestError,
  CometError,
  InternalError,
  responseAsCometError,
  UnauthorizedError,
} from '../../../util/error';
import type { GoodsUpdateRequest } from 'mirinae-comet';

export const rentalUpdateHandler: APIGatewayProxyHandler = async (event) => {
  const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
  let data: GoodsUpdateRequest;
  try {
    data = JSON.parse(event.body) as GoodsUpdateRequest;
  } catch {
    return responseAsCometError(new BadRequestError('Data body is malformed JSON'));
  }
  if (!data || !data.id) {
    return responseAsCometError(new BadRequestError());
  }
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    console.debug('malformed token');
    return responseAsCometError(new UnauthorizedError());
  }
  try {
    const id = payload.aud as string;
    await assertAccessible(id, token, 'executive');
    const res = await updateGoods(data);
    return createResponse(200, { success: res });
  } catch (e) {
    console.error(e);
    return responseAsCometError(new InternalError());
  }
};
