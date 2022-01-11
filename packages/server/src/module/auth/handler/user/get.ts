import type {APIGatewayProxyHandler} from "aws-lambda";
import * as jwt from 'jsonwebtoken';
import {JWT_SECRET} from "../../../../env";
import type {JwtPayload} from "jsonwebtoken";
import {getUserInfo, updateUserInfo} from "../../data/user";
import {createResponse} from "../../../../common";
import type {UserInfo} from "types";
import {ResponsibleError} from "../../../../util/error";

export const getUserInfoHandler: APIGatewayProxyHandler = async (event) => {
    const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
    const id = (jwt.verify(token, JWT_SECRET) as JwtPayload).aud as string;
    const result = await getUserInfo(id);
    return createResponse(200, {
        success: true,
        result
    });
};

export const updateUserInfoHandler: APIGatewayProxyHandler = async (event) => {
    const token = (event.headers.Authorization ?? '').replace('Bearer ', '');
    let data: UserInfo;

    try {
        data = JSON.parse(event.body) as UserInfo;
    } catch {
        return createResponse(500, {
            success: false,
            error: 500,
            error_description: 'Data body is malformed JSON'
        });
    }
    if (!data.id) {
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
        const res = await updateUserInfo(id, token, {
            id: data.id,
            name: data.name,
            group: data.group
        });
        return createResponse(200, { success: true, ...res });
    } catch (e) {
        if (!(e instanceof ResponsibleError)) {
            console.error(e);
            const res = {
                success: false,
                error: 500,
                error_description: 'Internal error'
            };
            return createResponse(500, res);
        }
        return e.response();
    }
};
