import type { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponse, JWT_SECRET } from '../../../common';
import type { JwtPayload } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import { assertAccessible } from '../../auth/util/permission';
import { rentGoods } from '../data/rental';
import {
  BadRequestError,
  InternalError,
  responseAsCometError,
  UnauthorizedError,
} from '../../../util/error';
import type { GoodsRentRequest, GoodsRentResponse } from 'mirinae-comet';

export const rentalRentHandler: APIGatewayProxyHandler = async (event) => {
  const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
  let data: GoodsRentRequest;
  try {
    data = JSON.parse(event.body) as GoodsRentRequest;
  } catch {
    return responseAsCometError(new BadRequestError('Data body is malformed JSON'));
  }
  if (!data || !data.user) {
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
    const res = await rentGoods(
      requester,
      data.user,
      data.goodsId,
      new Date(data.until),
      data.additionalInfo,
    );
    return createResponse<GoodsRentResponse>(200, { success: true, result: res });
  } catch (e) {
    console.error(e);
    return responseAsCometError(new InternalError());
  }
};
