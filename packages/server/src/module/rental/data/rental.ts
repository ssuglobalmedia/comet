import type { Goods, GoodsDao, RentStatus, RentStatusDao, User } from 'mirinae-comet';

import dynamoDB, { TableName } from '../../../util/database';
import type { GetItemInput } from 'aws-sdk/clients/dynamodb';

export const fromRentStatusDao = (dao: RentStatusDao): RentStatus => ({
	userId: dao.uI.S,
	until: new Date(dao.u.S),
	amount: parseInt(dao.a.N),
	additionalInfo: dao.aI.S
});

export const toRentStatusDao = (rs: RentStatus): RentStatusDao => ({
	uI: { S: rs.userId },
	u: { S: rs.until.toISOString() },
	a: { N: `${rs.amount}` },
	aI: { S: rs.additionalInfo }
});

export const fromGoodsDao = (dao: GoodsDao): Goods => ({
	name: dao.n.S,
	category: dao.c.S,
	amount: parseInt(dao.a.N),
	rentStatus: dao.rS.map(fromRentStatusDao)
});

export const toGoodsDao = (goods: Goods): GoodsDao => ({
	n: { S: goods.name },
	c: { S: goods.category },
	a: { N: `${goods.amount}` },
	rS: goods.rentStatus.map(toRentStatusDao)
});

export const getRentalList = async (): Record<string, Goods> => {
	const req: GetItemInput = {
		TableName,
		Key: {
			module: { S: 'rental' },
			dataId: { S: 'list' }
		}
	};
	const res = await dynamoDB.getItem(req).promise();

	if (res.Item === undefined) return {};
	return Object.fromEntries(
		Object.entries(res.Item).map(([key, goods]) => [
			key,
			fromGoodsDao(goods as unknown as GoodsDao)
		])
	);
};

export const addGoods = (goods: Goods) => {};

export const removeGoods = (rentalId: string) => {};

export const updateGoods = (goods: Goods) => {};

export const rentGoods = (user: User, rentalId: string, amount: number, until: Date) => {};

export const returnGoods = (user: User, rentalId: string) => {};
