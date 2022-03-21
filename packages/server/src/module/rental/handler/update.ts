import type { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponse } from '../../../common';

export const rentalUpdateHandler: APIGatewayProxyHandler = async (event) => {
	return createResponse(200, {
		success: true
	});
};
