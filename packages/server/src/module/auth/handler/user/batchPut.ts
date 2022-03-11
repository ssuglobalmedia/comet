import type { APIGatewayProxyHandler } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../../../env';
import type { JwtPayload } from 'jsonwebtoken';
import { createResponse } from '../../../../common';
import { ResponsibleError } from '../../../../util/error';
import { assertAccessible } from '../../util/permission';
import { batchPutUser } from '../../data/user';
import type { User } from 'mirinae-comet';

export const userBatchPutHandler: APIGatewayProxyHandler = async (event) => {
	const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
	let data: User[];
	try {
		data = JSON.parse(event.body) as User[];
	} catch {
		return createResponse(500, {
			success: false,
			error: 500,
			error_description: 'Data body is malformed JSON'
		});
	}
	if (!data || !Array.isArray(data)) {
		return createResponse(500, {
			success: false,
			error: 500,
			error_description: 'Internal error'
		});
	}
	let payload: JwtPayload;
	try {
		payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
	} catch {
		console.debug('malformed token');
		return createResponse(401, {
			success: false,
			error: 401,
			error_description: 'Unauthorized'
		});
	}
	try {
		const id = payload.aud as string;
		await assertAccessible(id, token, 'admin');
		// TODO: Split Request by 25 and do job partially
		const res = await batchPutUser(data);
		return createResponse(200, { success: true, ...res });
	} catch (e) {
		if (e instanceof ResponsibleError) {
			return e.response();
		}
		console.error(e);
		const res = {
			success: false,
			error: 500,
			error_description: 'Internal error'
		};
		return createResponse(500, res);
	}
};
