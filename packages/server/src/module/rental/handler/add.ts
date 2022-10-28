import type { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponse, JWT_SECRET } from '../../../common';
import type { Goods, GoodsAddResponse } from 'mirinae-comet';
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
import { updateGoods } from '../data/rental';

export const rentalAddHandler: APIGatewayProxyHandler = async (event) => {
  const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
  let data: Goods;
  try {
    data = JSON.parse(event.body) as Goods;
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
    return responseAsCometError(new UnauthorizedError());
  }
  try {
    const id = payload.aud as string;
    await assertAccessible(id, token, 'executive');
    const res = await updateGoods(data);
    return createResponse<GoodsAddResponse>(200, { success: true });
  } catch (e) {
    if (isCometError(e)) return responseAsCometError(e);
    console.error(e);
    return responseAsCometError(new InternalError());
  }
};
