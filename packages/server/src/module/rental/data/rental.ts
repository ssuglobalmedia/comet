import type {
	Goods,
	GoodsDao,
	GoodsUpdateRequest,
	RentStatus,
	RentStatusDao,
	User
} from 'mirinae-comet';

import dynamoDB, { TableName } from '../../../util/database';
import type {
	DeleteItemInput,
	QueryInput,
	QueryOutput,
	UpdateItemInput
} from 'aws-sdk/clients/dynamodb';

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

export const fromGoodsDao = (dao: GoodsDao): Goods => ({
	id: dao.dataId.S.substring(2),
	name: dao.n.S,
	category: dao.c.S,
	...(dao.rS?.M && { rentStatus: fromRentStatusDao(dao.rS.M) })
});

export const toGoodsDao = (goods: Goods): GoodsDao => ({
	module: { S: 'rental' },
	dataId: { S: `g-${goods.id}` },
	n: { S: goods.name },
	c: { S: goods.category },
	...(goods.rentStatus && { rS: { M: toRentStatusDao(goods.rentStatus) } })
});

export const queryGoods = async (startsWith = ''): Promise<Array<Goods>> => {
	let composedRes: Array<Goods> = [];
	const req: QueryInput = {
		TableName,
		KeyConditionExpression: '#module = :v1 AND begins_with(#dataId, :v2)',
		ExpressionAttributeNames: {
			'#module': 'module',
			'#dataId': 'dataId'
		},
		ExpressionAttributeValues: {
			':v1': { S: 'rental' },
			':v2': { S: `g-${startsWith}` }
		}
	};
	let res: QueryOutput;
	do {
		res = await dynamoDB
			.query({
				...req,
				...(res && res.LastEvaluatedKey && { ExclusiveStartKey: res.LastEvaluatedKey })
			})
			.promise();
		composedRes = [
			...composedRes,
			...res.Items.map<Goods>((v) => fromGoodsDao(v as unknown as GoodsDao))
		];
	} while (res.LastEvaluatedKey);
	return composedRes;
};

export const deleteGoods = async (goodsId: string) => {
	const req: DeleteItemInput = {
		TableName,
		Key: {
			module: { S: 'rental' },
			dataId: { S: `g-${goodsId}` }
		}
	};
	await dynamoDB.deleteItem(req).promise();
	return goodsId;
};

export const updateGoods = async (goodsUpdateRequest: GoodsUpdateRequest) => {
	let exp = '';
	if (goodsUpdateRequest.name) {
		exp += `${exp.length ? ', ' : 'SET '} n = :name`;
	}
	if (goodsUpdateRequest.category) {
		exp += `${exp.length ? ', ' : 'SET '} c = :category`;
	}
	const req: UpdateItemInput = {
		TableName,
		Key: {
			module: { S: 'rental' },
			dataId: { S: `g-${goodsUpdateRequest.id}` }
		},
		ExpressionAttributeValues: {
			...(goodsUpdateRequest.name && { ':name': { S: goodsUpdateRequest.name } }),
			...(goodsUpdateRequest.category && { ':category': { S: goodsUpdateRequest.category } })
		},
		UpdateExpression: exp,
		ReturnValues: 'UPDATED_NEW'
	};

	const res = await dynamoDB.updateItem(req).promise();
	return !!res.Attributes;
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
			dataId: { S: `g-${goodsId}` }
		},
		ExpressionAttributeValues: {
			':value': { M: toRentStatusDao(rentStatus) }
		},
		UpdateExpression: `SET rS = if_not_exists(rS, :value)`,
		ReturnValues: 'UPDATED_NEW'
	};
	const res = await dynamoDB.updateItem(req).promise();
	return !!res.Attributes.rS?.M;
};

export const returnGoods = async (user: User, goodsId: string) => {
	const req: UpdateItemInput = {
		TableName,
		Key: {
			module: { S: 'rental' },
			dataId: { S: `g-${goodsId}` }
		},
		ExpressionAttributeValues: {
			':userId': { S: user.userId }
		},
		ConditionExpression: 'attribute_exists(rS) and rS.uI = :userId',
		UpdateExpression: `REMOVE rS`,
		ReturnValues: 'UPDATED_OLD'
	};
	const res = await dynamoDB.updateItem(req).promise();
	return !res.Attributes.g?.M[goodsId];
};
