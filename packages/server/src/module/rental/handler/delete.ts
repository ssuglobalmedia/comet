import type { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponse, JWT_SECRET } from '../../../common';
import type { JwtPayload } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import { assertAccessible } from '../../auth/util/permission';
import { deleteGoods } from '../data/rental';
import {
  BadRequestError,
  InternalError,
  isCometError,
  responseAsCometError,
  UnauthorizedError,
} from '../../../util/error';
import type { GoodsDeleteRequest, GoodsDeleteResponse } from 'mirinae-comet';

export const rentalDeleteHandler: APIGatewayProxyHandler = async (event) => {
  const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
  let data: GoodsDeleteRequest;
  try {
    data = JSON.parse(event.body) as GoodsDeleteRequest;
  } catch {
    return responseAsCometError(new BadRequestError('Data body is malformed JSON'));
  }
  if (!data) {
    return responseAsCometError(new BadRequestError());
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
    const res = await deleteGoods(data.id);
    return createResponse<GoodsDeleteResponse>(200, { success: true, result: res });
  } catch (e) {
    if (isCometError(e)) return responseAsCometError(e);
    console.error(e);
    return responseAsCometError(new InternalError());
  }
};
