import type {GetItemInput} from "aws-sdk/clients/dynamodb";
import dynamoDB, {TableName} from "../../../util/database";
import {UnauthorizedError} from "../../../util/error";

export const adminId = process.env.ADMIN_ID ?? '20211561';

export function isAccessible(userGroup: string, group: string): boolean {
    const permissionLevel = {
        everyone: 0,
        certificated: 1,
        executive: 2,
        admin: 3
    };
    if (permissionLevel[group] === undefined) return false;
    return permissionLevel[userGroup] >= permissionLevel[group];
}

export async function assertAccessible(modId: string, token: string, group: string) {
    const authReq: GetItemInput = {
        TableName,
        Key: {
            module: { S: 'auth' },
            dataId: {
                S: `user-${modId}`
            }
        }
    };
    const authRes = await dynamoDB.getItem(authReq).promise();
    if (
        authRes.Item.dataId.S !== `user-${modId}` ||
        authRes.Item.accessToken?.S !== token ||
        (!isAccessible(authRes.Item.userGroup?.S, group) && modId !== adminId)
    ) {
        throw new UnauthorizedError('Unauthorized');
    }
}