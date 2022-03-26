import type { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponse } from '../../../common';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../../env';
import { JsonWebTokenError, JwtPayload, TokenExpiredError } from 'jsonwebtoken';
import { ResponsibleError } from '../../../util/error';
import { getRentalList } from '../data/rental';
import { assertAccessible } from '../../auth/util/permission';

export const rentalGetHandler: APIGatewayProxyHandler = async (event) => {
	const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
	try {
		const id = (jwt.verify(token, JWT_SECRET) as JwtPayload).aud as string;
		await assertAccessible(id, token, 'certificated');
		const result = await getRentalList();
		return createResponse(200, {
			success: true,
			result
		});
	} catch (e) {
		if (e instanceof ResponsibleError) {
			return e.response();
		}
		if (e instanceof JsonWebTokenError || e instanceof TokenExpiredError) {
			return createResponse(401, {
				success: false,
				error: 401,
				description: 'Unauthorized'
			});
		}
		console.error(e);
		return createResponse(500, {
			success: false,
			error: 500,
			description: 'Internal Error'
		});
	}
};
