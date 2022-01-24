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
		userName: res.Item.userName?.S ?? '',
		userGroup: res.Item.userGroup?.S ?? 'unregistered'
	};
};

export function isAccessible(userGroup: string, group: string): boolean {
	const permissionLevel = {
		everyone: 0,
		certificated: 1,
		executive: 2,
		admin: 3
	};
	if (permissionLevel[group] === undefined) return false;
	return permissionLevel[userGroup] >= permissionLevel[group];
}

const assertAccessible = async function (modId: string, token: string, group: string) {
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
		(!isAccessible(authRes.Item.userGroup?.S, group) && modId !== adminId)
	) {
		throw new UnauthorizedError('Unauthorized');
	}
};

type UserInfoUpdateRequest = {
	userId: string;
	userName?: string;
	userGroup?: string;
	phone?: string;
};

export const updateUserInfo = async function (
	modId: string,
	token: string,
	info: UserInfoUpdateRequest
): Promise<UserInfoUpdateRequest> {
	await assertAccessible(modId, token, 'admin');
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
	if (info.userGroup) ret.userGroup = info.userGroup;
	if (info.userName) ret.userName = info.userName;
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
				userGroup: { S: v.userGroup },
				userName: { S: v.userName }
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
