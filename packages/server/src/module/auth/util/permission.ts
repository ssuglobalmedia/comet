import type { GetItemInput } from 'aws-sdk/clients/dynamodb';
import dynamoDB, { TableName } from '../../../util/database';
import { UnauthorizedError } from '../../../util/error';
import type { User, UserDao } from 'mirinae-comet';
import { fromUserDao } from '../data/user';

export const adminId = process.env.ADMIN_ID ?? '20211561';

export const permissionLevel: { [group: string]: number } = {
  everyone: 0,
  certificated: 1,
  executive: 2,
  admin: 3,
};

export const groupIndex = ['everyone', 'certificated', 'executive', 'admin'];

export function isAccessible(userGroup: string, group: string): boolean {
  if (permissionLevel[group] === undefined) return false;
  return permissionLevel[userGroup] >= permissionLevel[group];
}

export async function assertAccessible(id: string, token: string, group: string): Promise<User> {
  const authReq: GetItemInput = {
    TableName,
    Key: {
      module: { S: 'auth' },
      dataId: {
        S: `user-${id}`,
      },
    },
  };
  const authRes = await dynamoDB.getItem(authReq).promise();
  if (
    authRes.Item.dataId.S !== `user-${id}` ||
    authRes.Item.accessToken?.S !== token ||
    (!isAccessible(authRes.Item.userGroup?.S, group) && id !== adminId)
  ) {
    throw new UnauthorizedError('Unauthorized');
  }
  return fromUserDao(authRes.Item as unknown as UserDao);
}
