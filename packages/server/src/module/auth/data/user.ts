import type { UserInfo } from 'types';
import type {
	BatchWriteItemInput,
	ExpressionAttributeValueMap,
	GetItemInput,
	UpdateItemInput,
	WriteRequest
} from 'aws-sdk/clients/dynamodb';
import dynamoDB, { TableName } from '../../../util/database';
import { NotFoundError, ResponsibleError, UnauthorizedError } from '../../../util/error';

export const adminId = process.env.ADMIN_ID ?? '20211561';

export const getUserInfo = async function (id: string): Promise<UserInfo> {
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
	return {
		userId: id,
		name: res.Item.name?.S ?? '',
		group: res.Item.group?.S ?? 'unregistered'
	};
};

const assertAdmin = async function (modId: string, token: string) {
	const authReq: GetItemInput = {
		TableName,
		Key: {
			module: { S: 'auth' },
			dataId: {
				S: `user-${modId}`
			}
		}
	};
	const authRes = await dynamoDB.getItem(authReq).promise();
	if (
		authRes.Item.dataId.S !== `user-${modId}` ||
		authRes.Item.accessToken?.S !== token ||
		(authRes.Item.isAdmin?.BOOL !== true && modId !== adminId)
	) {
		throw new UnauthorizedError('Unauthorized');
	}
};

type UserInfoUpdateRequest = {
	userId: string;
	name?: string;
	group?: string;
};

export const updateUserInfo = async function (
	modId: string,
	token: string,
	info: UserInfoUpdateRequest
): Promise<UserInfoUpdateRequest> {
	await assertAdmin(modId, token);
	const attributes: ExpressionAttributeValueMap = {};
	let updateExp = '';
	if (info.group !== undefined) {
		attributes[':group'] = { S: info.group };
		updateExp = 'SET group = :group';
	}
	if (info.name) {
		attributes[':name'] = { S: info.name };
		updateExp += `${updateExp ? ',' : 'SET'} name = :name`;
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
	const ret: UserInfoUpdateRequest = { userId: info.userId };
	if (info.group) ret.group = info.group;
	if (info.name) ret.name = info.name;
	return ret;
};

export const batchCreateUserInfo = async function (
	modId: string,
	token: string,
	infos: Array<UserInfo>
): Promise<Array<UserInfo>> {
	if (infos.length === 0) return infos;
	if (infos.length > 25) throw new ResponsibleError('Maximum amount of batch creation is 25');
	const authReq: GetItemInput = {
		TableName,
		Key: {
			module: { S: 'auth' },
			dataId: {
				S: `user-${modId}`
			}
		}
	};
	const authRes = await dynamoDB.getItem(authReq).promise();
	if (authRes.Item.dataId.S !== `user-${modId}` || authRes.Item.accessToken?.S !== token) {
		throw new UnauthorizedError('Unauthorized');
	}
	const requests: WriteRequest[] = infos.map((v: UserInfo) => ({
		PutRequest: {
			Item: {
				dataId: { S: `user-${v.userId}` },
				group: { S: v.group },
				name: { S: v.name }
			}
		}
	}));
	const req: BatchWriteItemInput = {
		RequestItems: {
			TableName: requests
		}
	};
	await dynamoDB.batchWriteItem(req).promise();
	return infos;
};
