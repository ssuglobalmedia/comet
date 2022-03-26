import type { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponse } from '../../../common';
import type { Goods } from 'mirinae-comet';
import type { JwtPayload } from 'jsonwebtoken';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../../env';
import { assertAccessible } from '../../auth/util/permission';
import { ResponsibleError } from '../../../util/error';
import { addGoods } from '../data/rental';

export const rentalAddHandler: APIGatewayProxyHandler = async (event) => {
	const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
	let data: Goods;
	try {
		data = JSON.parse(event.body) as Goods;
	} catch {
		return createResponse(500, {
			success: false,
			error: 500,
			error_description: 'Data body is malformed JSON'
		});
	}
	if (!data || !data.id) {
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
		await assertAccessible(id, token, 'executive');
		const res = await addGoods(data);
		return createResponse(200, { success: res });
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
