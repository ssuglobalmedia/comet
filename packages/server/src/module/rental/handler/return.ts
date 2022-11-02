import type { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponse, JWT_SECRET } from '../../../common';
import type { JwtPayload } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import { assertAccessible } from '../../auth/util/permission';
import {
  BadRequestError,
  InternalError,
  isCometError,
  responseAsCometError,
  UnauthorizedError,
} from '../../../util/error';
import { returnGoods } from '../data/rental';
import type { GoodsReturnRequest, GoodsReturnResponse } from 'mirinae-comet';

export const rentalReturnHandler: APIGatewayProxyHandler = async (event) => {
  const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
  let data: GoodsReturnRequest;
  try {
    data = JSON.parse(event.body) as GoodsReturnRequest;
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
    const requester = await assertAccessible(id, token, 'executive');
    const res = await returnGoods(requester, data.userId, data.goodsId);
    return createResponse<GoodsReturnResponse>(200, { success: true, result: res });
  } catch (e) {
    if (isCometError(e)) return responseAsCometError(e);
    console.error(e);
    return responseAsCometError(new InternalError());
  }
};
