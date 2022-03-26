import type {
	Goods,
	GoodsDao,
	GoodsUpdateRequest,
	RentStatus,
	RentStatusDao,
	User
} from 'mirinae-comet';

import dynamoDB, { TableName } from '../../../util/database';
import type { GetItemInput, MapAttributeValue, UpdateItemInput } from 'aws-sdk/clients/dynamodb';

export const fromRentStatusDao = (dao: RentStatusDao): RentStatus => ({
	userId: dao.uI.S,
	userName: dao.uN.S,
	until: new Date(dao.u.S),
	additionalInfo: dao.aI.S
});

export const toRentStatusDao = (rs: RentStatus): RentStatusDao => ({
	uI: { S: rs.userId },
	uN: { S: rs.userName },
	u: { S: rs.until.toISOString() },
	aI: { S: rs.additionalInfo }
});

export const fromGoodsDao = (id: string, dao: GoodsDao): Goods => ({
	id,
	name: dao.n.S,
	category: dao.c.S,
	...(dao.rS?.M && { rentStatus: fromRentStatusDao(dao.rS.M) })
});

export const toGoodsDao = (goods: Goods): GoodsDao => ({
	n: { S: goods.name },
	c: { S: goods.category },
	...(goods.rentStatus && { rS: { M: toRentStatusDao(goods.rentStatus) } })
});

export const getRentalList = async (): Promise<Record<string, Goods>> => {
	const req: GetItemInput = {
		TableName,
		Key: {
			module: { S: 'rental' },
			dataId: { S: 'list' }
		}
	};
	const res = await dynamoDB.getItem(req).promise();

	if (res.Item?.g?.M) {
		return Object.fromEntries(
			Object.entries(res.Item.g.M).map(([key, goods]) => [
				key,
				fromGoodsDao(key, goods as unknown as GoodsDao)
			])
		);
	}
	return {};
};

export const addGoods = async (goods: Goods) => {
	const req: UpdateItemInput = {
		TableName,
		Key: {
			module: { S: 'rental' },
			dataId: { S: 'list' }
		},
		ExpressionAttributeNames: {
			'#id': goods.id
		},
		ExpressionAttributeValues: {
			':value': { M: toGoodsDao(goods) as MapAttributeValue }
		},
		UpdateExpression: `SET g.#id = if_not_exists(g.#id, :value)`,
		ReturnValues: 'UPDATED_NEW'
	};
	const res = await dynamoDB.updateItem(req).promise();
	return !!(res.Attributes.g?.M && Object.keys(res.Attributes.g?.M).length);
};

export const removeGoods = async (goodsId: string) => {
	const req: UpdateItemInput = {
		TableName,
		Key: {
			module: { S: 'rental' },
			dataId: { S: 'list' }
		},
		ExpressionAttributeNames: {
			'#id': goodsId
		},
		UpdateExpression: `REMOVE g.#id`,
		ReturnValues: 'UPDATED_OLD'
	};
	const res = await dynamoDB.updateItem(req).promise();
	return !!(res.Attributes.g?.M && Object.keys(res.Attributes.g?.M).length);
};

export const updateGoods = async (goodsUpdateRequest: GoodsUpdateRequest) => {
	let exp = '';
	if (goodsUpdateRequest.name) {
		exp += `${exp.length ? ', ' : 'SET '} g.#id.name = :name`;
	}
	if (goodsUpdateRequest.category) {
		exp += `${exp.length ? ', ' : 'SET '} g.#id.category = :category`;
	}
	const req: UpdateItemInput = {
		TableName,
		Key: {
			module: { S: 'rental' },
			dataId: { S: 'list' }
		},
		ExpressionAttributeNames: {
			'#id': goodsUpdateRequest.id
		},
		ExpressionAttributeValues: {
			...(goodsUpdateRequest.name && { ':name': { S: goodsUpdateRequest.name } }),
			...(goodsUpdateRequest.category && { ':category': { S: goodsUpdateRequest.category } })
		},
		UpdateExpression: exp,
		ReturnValues: 'UPDATED_NEW'
	};

	const res = await dynamoDB.updateItem(req).promise();
	return !!(res.Attributes.g?.M && Object.keys(res.Attributes.g?.M).length);
};

export const rentGoods = async (
	user: User,
	goodsId: string,
	until: Date,
	additionalInfo: string = undefined
) => {
	const rentStatus: RentStatus = {
		userId: user.userId,
		userName: user.userName,
		until,
		...(additionalInfo && { additionalInfo })
	};
	const req: UpdateItemInput = {
		TableName,
		Key: {
			module: { S: 'rental' },
			dataId: { S: 'list' }
		},
		ExpressionAttributeNames: {
			'#id': goodsId
		},
		ExpressionAttributeValues: {
			':value': { M: toRentStatusDao(rentStatus) }
		},
		ConditionExpression: 'attribute_exists(g.#id)',
		UpdateExpression: `SET g.#id.rS = if_not_exists(g.#id.rS, :value)`,
		ReturnValues: 'UPDATED_NEW'
	};
	const res = await dynamoDB.updateItem(req).promise();
	return !!(res.Attributes.g?.M && Object.keys(res.Attributes.g?.M).length);
};

export const returnGoods = async (user: User, goodsId: string) => {
	const req: UpdateItemInput = {
		TableName,
		Key: {
			module: { S: 'rental' },
			dataId: { S: 'list' }
		},
		ExpressionAttributeNames: {
			'#id': goodsId
		},
		ExpressionAttributeValues: {
			':userId': { S: user.userId }
		},
		ConditionExpression:
			'attribute_exists(g.#id) and attribute_exists(g.#id.rS) and g.#id.rS.userId = :userId',
		UpdateExpression: `REMOVE g.#id.rS`,
		ReturnValues: 'UPDATED_OLD'
	};
	const res = await dynamoDB.updateItem(req).promise();
	return !!res.Attributes.g?.M[goodsId];
};
