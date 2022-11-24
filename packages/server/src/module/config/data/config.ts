import type { Config, ConfigDao, ConfigUpdateRequest } from 'mirinae-comet';
import type {
  ExpressionAttributeNameMap,
  ExpressionAttributeValueMap,
  GetItemInput,
  UpdateItemInput,
} from 'aws-sdk/clients/dynamodb';
import dynamoDB, { TableName } from '../../../util/database';

export function toConfigDao(config: Config): ConfigDao {
  const logFormatData = Object.fromEntries(
    Object.entries(config.logFormat ?? {}).map(([moduleAction, string]) => {
      return [moduleAction, { S: string }];
    }),
  );
  return {
    rW: {
      M: {
        u: { S: config.rentalWebhook.url },
        t: { S: config.rentalWebhook.type },
      },
    },
    lF: {
      M: logFormatData,
    },
  };
}

export function fromConfigDao(dao: ConfigDao): Config {
  const logFormatData = Object.fromEntries(
    Object.entries(dao.lF?.M ?? {}).map(([moduleAction, string]) => {
      return [moduleAction, string.S];
    }),
  );
  const ret: Config = {
    logFormat: logFormatData,
  };
  if (dao.rW?.M?.u?.S && dao.rW?.M?.t?.S) {
    ret.rentalWebhook = {
      url: dao.rW.M.u.S,
      type: dao.rW.M.t.S,
    };
  }
  return ret;
}

export async function getConfig(): Promise<Config> {
  const req: GetItemInput = {
    TableName,
    Key: {
      module: { S: 'config' },
      dataId: { S: 'SERVICE' },
    },
  };
  const res = await dynamoDB.getItem(req).promise();
  if (res.Item === undefined) {
    return {
      logFormat: {},
    };
  }
  const dao: ConfigDao = res.Item as unknown as ConfigDao;
  return fromConfigDao(dao);
}

export async function updateConfig(config: ConfigUpdateRequest): Promise<boolean> {
  const attributes: ExpressionAttributeValueMap = {};
  const attributeNames: ExpressionAttributeNameMap = {};
  let updateExp = '';
  let removeExp = '';
  if (config.rentalWebhook) {
    attributes[':rentalWebhook'] = {
      M: {
        u: { S: config.rentalWebhook.url },
        t: { S: config.rentalWebhook.type },
      },
    };
    updateExp = 'SET rW = :rentalWebhook';
  }
  if (config.rentalWebhook == null) {
    removeExp = 'REMOVE rW';
  }
  if (config.logFormat) {
    attributes[':logFormatMap'] = { M: {} };
    updateExp += `${updateExp ? ',' : 'SET'} lF = if_not_exists(lF, :logFormatMap)`;
    Object.entries(config.logFormat).forEach(([moduleAction, string]) => {
      if (string) {
        attributes[`:${moduleAction}`] = { S: string };
        attributeNames[`#${moduleAction}`] = `${moduleAction}`;
        updateExp += `${updateExp ? ',' : 'SET'} lF.#${moduleAction} = :${moduleAction}`;
      } else {
        attributeNames[`#${moduleAction}`] = `${moduleAction}`;
        removeExp += `${removeExp ? ',' : 'REMOVE'} lF.#${moduleAction}`;
      }
    });
  }
  console.log(updateExp + `${removeExp ? ` ${removeExp}` : ''}`);
  const req: UpdateItemInput = {
    TableName,
    Key: {
      module: { S: 'config' },
      dataId: { S: 'SERVICE' },
    },
    UpdateExpression: updateExp + `${removeExp ? ` ${removeExp}` : ''}`,
    ...(Object.keys(attributeNames).length && {
      ExpressionAttributeNames: attributeNames,
    }),
    ...(Object.keys(attributes).length && {
      ExpressionAttributeValues: attributes,
    }),
  };
  await dynamoDB.updateItem(req).promise();
  return true;
}
