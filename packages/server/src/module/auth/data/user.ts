import type { User, UserDao } from 'mirinae-comet';
import type {
	BatchWriteItemInput,
	ExpressionAttributeValueMap,
	GetItemInput,
	QueryInput,
	UpdateItemInput,
	WriteRequest
} from 'aws-sdk/clients/dynamodb';
import dynamoDB, { TableName } from '../../../util/database';
import { NotFoundError, ResponsibleError } from '../../../util/error';

export const adminId = process.env.ADMIN_ID ?? '20211561';

export const fromUserDao = (dao: UserDao): User => ({
	userId: dao.dataId.S.substring(5),
	userName: dao.userName?.S,
	userGroup: dao.userGroup?.S ?? 'unregistered',
	...(dao.lastSemester?.N && {
		lastSemester:
			parseInt(dao.lastSemester.N) < 0
				? `${parseInt(dao.lastSemester.N) * -1}-1`
				: `${dao.lastSemester.N}-2`
	}),
	...(dao.phone?.S && { phone: dao.phone.S })
});
export const toUserDao = (user: User): UserDao => ({
	module: { S: 'auth' },
	dataId: { S: `user-${user.userId}` },
	userName: { S: user.userName },
	userGroup: { S: user.userGroup },
	...(user.lastSemester && {
		lastSemester: {
			N: `${
				parseInt(user.lastSemester.split('-')[0]) *
				(user.lastSemester.split('-')[1] === '1' ? -1 : 1)
			}`
		}
	}),
	...(user.phone && { phone: { S: user.phone } })
});

export const getUser = async function (id: string): Promise<User> {
	const req: GetItemInput = {
		TableName,
		Key: {
			module: { S: 'auth' },
			dataId: { S: `user-${id}` }
		}
	};
	const res = await dynamoDB.getItem(req).promise();
	if (res.Item === undefined) {
		throw new NotFoundError(`Cannot find user info of id ${id}`);
	}
	const dao: UserDao = res.Item as unknown as UserDao;
	return fromUserDao(dao);
};
export const queryUser = async function (startsWith: string): Promise<Array<User>> {
	const req: QueryInput = {
		TableName,
		KeyConditionExpression: '#module = :v1 AND begins_with(#dataId, :v2)',
		ExpressionAttributeNames: {
			'#module': 'module',
			'#dataId': 'dataId'
		},
		ExpressionAttributeValues: {
			':v1': { S: 'auth' },
			':v2': { S: `user-${startsWith}` }
		},
		ProjectionExpression: 'dataId, userName, userGroup, lastSemester, phone'
	};
	const res = await dynamoDB.query(req).promise();
	return res.Items.map((v) => fromUserDao(v as unknown as UserDao));
};

type UserUpdateRequest = {
	userId: string;
	userName?: string;
	userGroup?: string;
	lastSemester?: string;
	phone?: string;
};

export const updateUser = async function (info: UserUpdateRequest): Promise<UserUpdateRequest> {
	const attributes: ExpressionAttributeValueMap = {};
	let updateExp = '';
	if (info.userGroup !== undefined) {
		attributes[':userGroup'] = { S: info.userGroup };
		updateExp = 'SET userGroup = :userGroup';
	}
	if (info.userName) {
		attributes[':userName'] = { S: info.userName };
		updateExp += `${updateExp ? ',' : 'SET'} userName = :userName`;
	}
	if (info.lastSemester) {
		const sem =
			parseInt(info.lastSemester.split('-')[0]) *
			(info.lastSemester.split('-')[1] === '1' ? -1 : 1);
		attributes[':lastSemester'] = { N: `${sem}` };
		updateExp += `${updateExp ? ',' : 'SET'} lastSemester = :lastSemester`;
	}
	if (info.phone) {
		attributes[':phone'] = { S: info.phone };
		updateExp += `${updateExp ? ',' : 'SET'} phone = :phone`;
	}
	const req: UpdateItemInput = {
		TableName,
		Key: {
			module: { S: 'auth' },
			dataId: { S: `user-${info.userId}` }
		},
		UpdateExpression: updateExp,
		ExpressionAttributeValues: attributes
	};
	await dynamoDB.updateItem(req).promise();
	return {
		userId: info.userId,
		...(info.userGroup && { userGroup: info.userGroup }),
		...(info.userName && { userName: info.userName }),
		...(info.lastSemester && { lastSemester: info.lastSemester }),
		...(info.phone && { phone: info.phone })
	};
};

export const batchPutUser = async function (infos: Array<User>): Promise<Array<User>> {
	if (infos.length === 0) return infos;
	if (infos.length > 25) throw new ResponsibleError('Maximum amount of batch creation is 25');
	const requests: WriteRequest[] = infos.map((v: User) => ({
		PutRequest: {
			Item: {
				...toUserDao(v)
			}
		}
	}));
	const req: BatchWriteItemInput = {
		RequestItems: {}
	};
	req.RequestItems[TableName] = requests;
	const res = await dynamoDB.batchWriteItem(req).promise();
	console.log(res);
	return infos;
};

export const batchDeleteUser = async function (ids: Array<string>): Promise<Array<string>> {
	if (ids.length === 0) return ids;
	if (ids.length > 25) throw new ResponsibleError('Maximum amount of batch creation is 25');
	const requests: WriteRequest[] = ids.map((v: string) => ({
		DeleteRequest: {
			Key: {
				module: {
					S: 'auth'
				},
				dataId: {
					S: `user-${v}`
				}
			}
		}
	}));
	const req: BatchWriteItemInput = {
		RequestItems: {}
	};
	req.RequestItems[TableName] = requests;
	const res = await dynamoDB.batchWriteItem(req).promise();
	console.log(res);
	return ids;
};
