import type { UpdateItemInput } from 'aws-sdk/clients/dynamodb';
import dynamoDB, { TableName } from '../../../util/database';
import { UnauthorizedError } from '../../../util/error';
import { adminId } from './user';

export const revokeToken = async function (
	id: string,
	token: string
): Promise<{ accessToken: string }> {
	const req: UpdateItemInput = {
		TableName,
		Key: { module: { S: 'auth' }, dataId: { S: `user-${id}` } },
		UpdateExpression: 'REMOVE accessToken',
		ConditionExpression: 'accessToken = :token',
		ExpressionAttributeValues: {
			':token': { S: token }
		},
		ReturnValues: 'UPDATED_OLD'
	};
	const res = await dynamoDB.updateItem(req).promise();
	if (res.Attributes.hasOwnProperty('accessToken')) {
		return { accessToken: token };
	} else {
		throw new UnauthorizedError();
	}
};

export const issueToken = async function (
	id: string,
	token: string
): Promise<{ id: string; expires: number }> {
	const expires = Date.now() + 3600 * 1000 * 24;
	const req: UpdateItemInput = {
		TableName,
		Key: { module: { S: 'auth' }, dataId: { S: `user-${id}` } },
		UpdateExpression: 'SET accessToken = :token, expiresOn = :expiresOn',
		...(id !== adminId && { ConditionExpression: 'attribute_exists(userGroup)' }),
		ExpressionAttributeValues: {
			':token': { S: token },
			':expiresOn': { N: `${expires}` }
		},
		ReturnValues: 'UPDATED_NEW'
	};
	const res = await dynamoDB.updateItem(req).promise();
	if (res.Attributes.hasOwnProperty('accessToken')) {
		return { id, expires };
	} else {
		throw new UnauthorizedError('Unauthorized', { id, expires });
	}
};
