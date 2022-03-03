import type { APIGatewayProxyHandler } from 'aws-lambda';
import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../../../../env';
import type { JwtPayload } from 'jsonwebtoken';
import { createResponse } from '../../../../common';
import { ResponsibleError } from '../../../../util/error';
import {JsonWebTokenError, TokenExpiredError} from "jsonwebtoken";
import {assertAccessible} from "../../util/permission";

export const batchUpdateHandler: APIGatewayProxyHandler = async (event) => {
    const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
    try {
        const id = (jwt.verify(token, JWT_SECRET) as JwtPayload).aud as string;
        await assertAccessible(id, token, "admin");
        // TODO: Create Actual batch update handler.
        return createResponse(200, {
            success: true
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
        return createResponse(500, {
            success: false,
            error: 500,
            description: 'Internal Error'
        });
    }
};
