import type { UserInfo } from 'types';
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
	const ret: UserInfo = {
		userId: id,
		userName: res.Item.userName?.S ?? '',
		userGroup: res.Item.userGroup?.S ?? 'unregistered'
	};
	if (res.Item.lastSemester?.S) {
		ret.lastSemester = res.Item.lastSemester?.S;
	}
	if (res.Item.phone?.S) {
		ret.phone = res.Item.phone?.S;
	}
	return ret;
};
export const getAllUserInfo = async function (startsWith: string): Promise<Array<UserInfo>> {
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
		}
	};
	const res = await dynamoDB.query(req).promise();
	return res.Items.map((v) => {
		const info: UserInfo = {
			userId: v.dataId.S.substr(5),
			userName: v.userName.S,
			userGroup: v.userGroup.S ?? 'unregistered'
		};
		if (v.lastSemester?.S) {
			info.lastSemester = v.lastSemester?.S;
		}
		if (v.phone?.S) {
			info.phone = v.phone?.S;
		}
		return info;
	});
};

type UserInfoUpdateRequest = {
	userId: string;
	userName?: string;
	userGroup?: string;
	phone?: string;
};

export const updateUserInfo = async function (
	info: UserInfoUpdateRequest
): Promise<UserInfoUpdateRequest> {
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

export const batchPutUserInfo = async function (infos: Array<UserInfo>): Promise<Array<UserInfo>> {
	if (infos.length === 0) return infos;
	if (infos.length > 25) throw new ResponsibleError('Maximum amount of batch creation is 25');
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

export const batchDeleteUserInfo = async function (ids: Array<string>): Promise<Array<string>> {
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
		RequestItems: {
			TableName: requests
		}
	};
	await dynamoDB.batchWriteItem(req).promise();
	return ids;
};
