import type { Log, LogDao } from 'mirinae-comet';
import type { PutItemInput, QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb';
import dynamoDB, { TableName } from '../../../util/database';

export const fromLogDao = (dao: LogDao): Log => ({
  date: dao.dataId.S.substring(2),
  userId: dao.uI.S,
  userName: dao.uN.S,
  module: dao.m.S,
  target: dao.t.S,
  action: dao.a.S,
  ...(dao.d?.S && { data: dao.d.S }),
});

export const toLogDao = (log: Log): LogDao => ({
  module: { S: 'log' },
  dataId: { S: `l-${log.date}` },
  uI: { S: log.userId },
  uN: { S: log.userName },
  m: { S: log.module },
  t: { S: log.target },
  a: { S: log.action },
  ...(log.data && { d: { S: log.data } }),
});

export const queryLogs = async (
  year: number = undefined,
  month: number = undefined,
  day: number = undefined,
): Promise<Array<Log>> => {
  let composedRes: Array<Log> = [];
  const date = year
    ? month
      ? day
        ? `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-${String(
            day,
          ).padStart(2, '0')}`
        : `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}`
      : `${String(year).padStart(4, '0')}`
    : '';
  const req: QueryInput = {
    TableName,
    KeyConditionExpression: '#module = :v1 AND begins_with(#dataId, :v2)',
    ExpressionAttributeNames: {
      '#module': 'module',
      '#dataId': 'dataId',
    },
    ExpressionAttributeValues: {
      ':v1': { S: 'log' },
      ':v2': { S: `l-${date}` },
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
      ...res.Items.map<Log>((v) => fromLogDao(v as unknown as LogDao)),
    ];
  } while (res.LastEvaluatedKey);
  return composedRes;
};

export const putLog = async (log: Log): Promise<boolean> => {
  const req: PutItemInput = {
    TableName,
    Item: {
      ...toLogDao(log),
    },
  };
  const res = await dynamoDB.putItem(req).promise();
  console.log(res);
  return true;
};
