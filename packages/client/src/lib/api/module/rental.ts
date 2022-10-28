import { z } from 'zod';
// eslint-disable-next-line import/extensions
import { dateSchema, fetchApi } from '$lib/api/common';
import type {
  Goods,
  GoodsAddResponse,
  GoodsDeleteResponse,
  GoodsQueryResponse,
  GoodsRentRequest,
  GoodsRentResponse,
  GoodsReturnRequest,
  GoodsReturnResponse,
  GoodsUpdateRequest,
  GoodsUpdateResponse,
} from 'mirinae-comet';
import type { ClientResponse } from '../../../global';

const rentStatus = z.object({
  userId: z.string(),
  userName: z.string(),
  until: dateSchema,
  additionalInfo: z.string().optional(),
  announced: z.boolean().optional().default(false),
});

const goods = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  permission: z.string(),
  location: z.string(),
  rentStatus: rentStatus.optional(),
});

export const apiGoodsAdd = async (goodsToAdd: Goods): Promise<ClientResponse<GoodsAddResponse>> =>
  fetchApi<void>('/module/api/rental/add', z.any().optional(), {
    method: 'POST',
    body: JSON.stringify(goodsToAdd),
  });

export const apiGoodsDelete = async (
  goodsName: string,
): Promise<ClientResponse<GoodsDeleteResponse>> =>
  fetchApi<string>('/module/api/rental/delete', z.string(), {
    method: 'POST',
    body: JSON.stringify({ id: goodsName }),
  });

export const apiGoodsQuery = async (): Promise<ClientResponse<GoodsQueryResponse>> =>
  fetchApi<Goods[]>('/module/api/rental/query', z.array(goods));

export const apiGoodsRent = async (
  req: GoodsRentRequest,
): Promise<ClientResponse<GoodsRentResponse>> =>
  fetchApi<boolean>('/module/api/rental/rent', z.boolean(), {
    method: 'POST',
    body: JSON.stringify(req),
  });

export const apiGoodsReturn = async (
  req: GoodsReturnRequest,
): Promise<ClientResponse<GoodsReturnResponse>> =>
  fetchApi<boolean>('/module/api/rental/return', z.boolean(), {
    method: 'POST',
    body: JSON.stringify(req),
  });

export const apiGoodsUpdate = async (
  req: GoodsUpdateRequest,
): Promise<ClientResponse<GoodsUpdateResponse>> =>
  fetchApi<boolean>('/module/api/rental/update', z.boolean(), {
    method: 'POST',
    body: JSON.stringify(req),
  });
