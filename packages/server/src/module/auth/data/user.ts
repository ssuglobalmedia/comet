import type {UserInfo} from "types";
import type {
    BatchWriteItemInput,
    ExpressionAttributeValueMap,
    GetItemInput,
    UpdateItemInput,
    WriteRequest
} from "aws-sdk/clients/dynamodb";
import dynamoDB, {TableName} from "../../../util/database";
import {ResponsibleError, UnauthorizedError} from "../../../util/error";

export const adminId = process.env.ADMIN_ID ?? '20211561';

export const getUserInfo = async function (id: string): Promise<UserInfo> {
    const req: GetItemInput = {
        TableName,
        Key: {
            id: {
                S: id
            }
        }
    };
    const res = await dynamoDB.getItem(req).promise();
    const ret: UserInfo = {
        id: id,
        name: res.Item.name?.S ?? "",
        group: res.Item.group?.S ?? "unregistered"
    };
    return ret;
};

const assertAdmin = async function (modId: string, token: string) {
    const authReq: GetItemInput = {
        TableName,
        Key: {
            id: {
                S: modId
            }
        }
    };
    const authRes = await dynamoDB.getItem(authReq).promise();
    if (
        authRes.Item.id.S !== modId ||
        authRes.Item.accessToken?.S !== token ||
        (authRes.Item.isAdmin?.BOOL !== true && modId !== adminId)
    ) {
        throw new UnauthorizedError('Unauthorized');
    }
};

type UserInfoUpdateRequest = {
    id: string;
    name?: string;
    group?: string;
}

export const updateUserInfo = async function (
    modId: string,
    token: string,
    info: UserInfoUpdateRequest
): Promise<UserInfoUpdateRequest> {
    await assertAdmin(modId, token);
    const attributes: ExpressionAttributeValueMap = {};
    let updateExp = '';
    if (info.group !== undefined) {
        attributes[':group'] = { S: info.group };
        updateExp = 'SET group = :group';
    }
    if (info.name) {
        attributes[':name'] = { S: info.name };
        updateExp += `${updateExp ? ',' : 'SET'} name = :name`;
    }
    const req: UpdateItemInput = {
        TableName,
        Key: {
            id: { S: info.id }
        },
        UpdateExpression: updateExp,
        ExpressionAttributeValues: attributes
    };
    await dynamoDB.updateItem(req).promise();
    const ret: UserInfoUpdateRequest = { id: info.id };
    if (info.group) ret.group = info.group;
    if (info.name) ret.name = info.name;
    return ret;
};

export const batchCreateUserInfo = async function (
    modId: string,
    token: string,
    infos: Array<UserInfo>
): Promise<Array<UserInfo>> {
    if (infos.length === 0) return infos;
    if (infos.length > 25) throw new ResponsibleError('Maximum amount of batch creation is 25');
    const authReq: GetItemInput = {
        TableName,
        Key: {
            id: {
                S: modId
            }
        }
    };
    const authRes = await dynamoDB.getItem(authReq).promise();
    if (authRes.Item.id.S !== modId || authRes.Item.accessToken?.S !== token) {
        throw new UnauthorizedError('Unauthorized');
    }
    const requests: WriteRequest[] = infos.map((v) => ({
        PutRequest: {
            Item: {
                id: { S: v.id },
                group: { S: v.group },
                name: { S: v.name }
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