import type { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
// TODO: Update v2 aws sdk to v3
export const JWT_SECRET = process.env.JWT_SECRET ?? 'this-is-sample-secret-key';

export function createResponse<T>(statusCode: number, body: string | T): APIGatewayProxyResult {
  const stringifyBody = typeof body === 'string' ? body : JSON.stringify(body);
  const res: APIGatewayProxyResult = {
    statusCode,
    body: stringifyBody,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (process.env.AWS_SAM_LOCAL) {
    res.headers['Access-Control-Allow-Origin'] = '*';
  }
  return res;
}

// eslint-disable-next-line @typescript-eslint/require-await
export const localCorsHandler: APIGatewayProxyHandler = async () => {
  if (!process.env.AWS_SAM_LOCAL) {
    return {
      statusCode: 200,
      body: '',
    };
  }
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
      'Access-Control-Allow-Methods': 'POST, GET',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Max-Age': '86400',
    },
    body: '',
  };
};
