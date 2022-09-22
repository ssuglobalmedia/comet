import type {
  Goods,
  GoodsDao,
  GoodsUpdateRequest,
  RentStatus,
  RentStatusDao,
  User,
} from 'mirinae-comet';

import dynamoDB, { TableName } from '../../../util/database';
import type {
  DeleteItemInput,
  QueryInput,
  QueryOutput,
  UpdateItemInput,
} from 'aws-sdk/clients/dynamodb';
import { groupIndex, permissionLevel } from '../../auth/util/permission';
import { putLog } from '../../log/data/log';

export const fromRentStatusDao = (dao: RentStatusDao): RentStatus => ({
  userId: dao.uI.S,
  userName: dao.uN.S,
  until: new Date(dao.u.S),
  additionalInfo: dao.aI.S,
  announced: dao.a?.BOOL ?? false,
});

export const toRentStatusDao = (rs: RentStatus): RentStatusDao => ({
  uI: { S: rs.userId },
  uN: { S: rs.userName },
  u: { S: rs.until.toISOString() },
  aI: { S: rs.additionalInfo },
  a: { BOOL: rs.announced ?? false },
});

export const fromGoodsDao = (dao: GoodsDao): Goods => ({
  id: dao.dataId.S.substring(2),
  name: dao.n.S,
  category: dao.c.S,
  location: dao.l?.S,
  permission: groupIndex[parseInt(dao.p.N)],
  ...(dao.rS?.M && { rentStatus: fromRentStatusDao(dao.rS.M) }),
});

export const toGoodsDao = (goods: Goods): GoodsDao => ({
  module: { S: 'rental' },
  dataId: { S: `g-${goods.id}` },
  n: { S: goods.name },
  c: { S: goods.category },
  l: { S: goods.location },
  p: { N: `${permissionLevel[goods.permission]}` },
  ...(goods.rentStatus && { rS: { M: toRentStatusDao(goods.rentStatus) } }),
});

export const queryGoods = async (startsWith = ''): Promise<Array<Goods>> => {
  let composedRes: Array<Goods> = [];
  const req: QueryInput = {
    TableName,
    KeyConditionExpression: '#module = :v1 AND begins_with(#dataId, :v2)',
    ExpressionAttributeNames: {
      '#module': 'module',
      '#dataId': 'dataId',
    },
    ExpressionAttributeValues: {
      ':v1': { S: 'rental' },
      ':v2': { S: `g-${startsWith}` },
    },
  };
  let res: QueryOutput;
  do {
    res = await dynamoDB
      .query({
        ...req,
        ...(res && res.LastEvaluatedKey && { ExclusiveStartKey: res.LastEvaluatedKey }),
      })
      .promise();
    composedRes = [
      ...composedRes,
      ...res.Items.map<Goods>((v) => fromGoodsDao(v as unknown as GoodsDao)),
    ];
  } while (res.LastEvaluatedKey);
  return composedRes;
};

export const deleteGoods = async (goodsId: string) => {
  const req: DeleteItemInput = {
    TableName,
    Key: {
      module: { S: 'rental' },
      dataId: { S: `g-${goodsId}` },
    },
  };
  await dynamoDB.deleteItem(req).promise();
  return goodsId;
};

export const updateGoods = async (goodsUpdateRequest: GoodsUpdateRequest) => {
  let exp = '';
  if (goodsUpdateRequest.name) {
    exp += `${exp.length ? ', ' : 'SET '} n = :name`;
  }
  if (goodsUpdateRequest.category) {
    exp += `${exp.length ? ', ' : 'SET '} c = :category`;
  }
  if (goodsUpdateRequest.permission) {
    exp += `${exp.length ? ', ' : 'SET '} p = :permission`;
  }
  if (goodsUpdateRequest.location) {
    exp += `${exp.length ? ', ' : 'SET '} l = :location`;
  }

  const req: UpdateItemInput = {
    TableName,
    Key: {
      module: { S: 'rental' },
      dataId: { S: `g-${goodsUpdateRequest.id}` },
    },
    ExpressionAttributeValues: {
      ...(goodsUpdateRequest.name && { ':name': { S: goodsUpdateRequest.name } }),
      ...(goodsUpdateRequest.category && { ':category': { S: goodsUpdateRequest.category } }),
      ...(goodsUpdateRequest.location && { ':location': { S: goodsUpdateRequest.location } }),
      ...(goodsUpdateRequest.permission && {
        ':permission': { N: `${permissionLevel[goodsUpdateRequest.permission]}` },
      }),
    },
    UpdateExpression: exp,
    ReturnValues: 'UPDATED_NEW',
  };

  const res = await dynamoDB.updateItem(req).promise();
  return !!res.Attributes;
};

export const rentGoods = async (
  requester: User,
  user: User,
  goodsId: string,
  until: Date,
  additionalInfo: string = undefined,
) => {
  const rentStatus: RentStatus = {
    userId: user.userId,
    userName: user.userName,
    until,
    ...(additionalInfo && additionalInfo.length > 0 && { additionalInfo }),
  };
  const req: UpdateItemInput = {
    TableName,
    Key: {
      module: { S: 'rental' },
      dataId: { S: `g-${goodsId}` },
    },
    ExpressionAttributeValues: {
      ':value': { M: toRentStatusDao(rentStatus) },
      ':userGroup': { N: `${permissionLevel[user.userGroup]}` },
    },
    UpdateExpression: 'SET rS = if_not_exists(rS, :value)',
    ConditionExpression: 'p <= :userGroup',
    ReturnValues: 'ALL_NEW',
  };
  const res = await dynamoDB.updateItem(req).promise();
  if (res.Attributes.rS?.M !== undefined) {
    putLog({
      date: new Date().toISOString(),
      userId: requester.userId,
      userName: requester.userName,
      module: 'rental',
      action: 'rent',
      target: `${user.userId}(${user.userName})`,
      data: JSON.stringify({
        goodsId: goodsId,
        name: res.Attributes.n?.S ?? '알 수 없음',
        until: until,
        additionalInfo: additionalInfo,
      }),
    })
      .then((r) => {
        console.log(r);
      })
      .catch((e) => console.error(e));
    return true;
  }
  return false;
};

export const returnGoods = async (requester: User, userId: string, goodsId: string) => {
  const req: UpdateItemInput = {
    TableName,
    Key: {
      module: { S: 'rental' },
      dataId: { S: `g-${goodsId}` },
    },
    ExpressionAttributeValues: {
      ':userId': { S: userId },
    },
    ConditionExpression: 'attribute_exists(rS) and rS.uI = :userId',
    UpdateExpression: 'REMOVE rS',
    ReturnValues: 'ALL_OLD',
  };
  const res = await dynamoDB.updateItem(req).promise();
  if (!res.Attributes.rS?.M[goodsId]) {
    putLog({
      date: new Date().toISOString(),
      userId: requester.userId,
      userName: requester.userName,
      module: 'rental',
      action: 'return',
      target: `${userId}`,
      data: JSON.stringify({
        goodsId: goodsId,
        name: res.Attributes.n?.S ?? '알 수 없음',
      }),
    })
      .then((r) => {
        console.log(r);
      })
      .catch((e) => console.error(e));
    return true;
  }
  return false;
};
