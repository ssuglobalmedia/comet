import type { APIGatewayProxyHandler } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../../../env';
import type { JwtPayload } from 'jsonwebtoken';
import { getUser } from '../../data/user';
import { createResponse } from '../../../../common';
import { ResponsibleError } from '../../../../util/error';
import {JsonWebTokenError, TokenExpiredError} from "jsonwebtoken";

export const userGetHandler: APIGatewayProxyHandler = async (event) => {
	const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
	try {
		const id = (jwt.verify(token, JWT_SECRET) as JwtPayload).aud as string;
		const result = await getUser(id);
		return createResponse(200, {
			success: true,
			result
		});
	} catch (e) {
		if (e instanceof ResponsibleError) {
			return e.response();
		}
		if(e instanceof JsonWebTokenError || e instanceof TokenExpiredError) {
			return createResponse(401, {
				success: false,
				error: 401,
				description: 'Unauthorized'
			})
		}
		console.error(e);
		return createResponse(500, {
			success: false,
			error: 500,
			description: 'Internal Error'
		});
	}
};
