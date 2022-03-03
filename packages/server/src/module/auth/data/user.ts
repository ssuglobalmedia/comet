import type { UserInfo } from 'types';
import type {
	BatchWriteItemInput,
	ExpressionAttributeValueMap,
	GetItemInput,
	UpdateItemInput,
	WriteRequest
} from 'aws-sdk/clients/dynamodb';
import dynamoDB, { TableName } from '../../../util/database';
import { NotFoundError, ResponsibleError} from '../../../util/error';

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
export const getAllUserInfo = async function (): Promise<Array<UserInfo>> {
	// TODO: Add Actual User Info getter.
	return [];
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

export const batchPutUserInfo = async function (
	infos: Array<UserInfo>
): Promise<Array<UserInfo>> {
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

export const batchDeleteUserInfo = async function (
	infos: Array<UserInfo>
): Promise<Array<UserInfo>> {
	if (infos.length === 0) return infos;
	if (infos.length > 25) throw new ResponsibleError('Maximum amount of batch creation is 25');
	const requests: WriteRequest[] = infos.map((v: UserInfo) => ({
		// TODO: Create Batch Delete Request
	}));
	const req: BatchWriteItemInput = {
		RequestItems: {
			TableName: requests
		}
	};
	await dynamoDB.batchWriteItem(req).promise();
	return infos;
};

export const batchUpdateUserInfo = async function (
	infos: Array<UserInfo>
): Promise<Array<UserInfo>> {
	if (infos.length === 0) return infos;
	if (infos.length > 25) throw new ResponsibleError('Maximum amount of batch creation is 25');
	const requests: WriteRequest[] = infos.map((v: UserInfo) => ({
		// TODO: Create Batch Update Request
	}));
	const req: BatchWriteItemInput = {
		RequestItems: {
			TableName: requests
		}
	};
	await dynamoDB.batchWriteItem(req).promise();
	return infos;
};
