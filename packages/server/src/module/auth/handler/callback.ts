import https from 'https';
import {
  InternalError,
  isCometError,
  responseAsCometError,
  UnauthorizedError,
} from '../../../util/error';
import * as jwt from 'jsonwebtoken';
import type { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponse, JWT_SECRET } from '../../../common';
import { issueToken } from '../data/token';

function requestBody(result: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(`https://canvas.ssu.ac.kr/learningx/login/from_cc?result=${result}`, (res) => {
        let body = '';
        res.on('data', function (chunk) {
          body += chunk;
        });
        res.on('end', function () {
          resolve(body);
        });
      })
      .on('error', (res) => {
        console.log('Error thrown..');
        reject(res);
      });
  });
}

async function obtainId(result: string) {
  const body = await requestBody(encodeURIComponent(result));
  if (body.indexOf('pseudonym_session_unique_id') < 0) {
    throw new UnauthorizedError('Unauthorized');
  }
  return body.substring(body.indexOf('pseudonym_session_unique_id') + 36).split('"')[0];
}

export const callbackHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const result = event?.queryStringParameters?.result;
    if (result) {
      console.log(result);
      const id = await obtainId(result);
      const accessToken = jwt.sign({ aud: id }, JWT_SECRET, {
        expiresIn: 3600 * 1000 * 24,
      });
      const issued = await issueToken(id, accessToken);
      const left = Math.floor((issued.expires - Date.now()) / 1000);
      const res = {
        success: true,
        id,
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: left,
      };
      return createResponse(200, { success: true, ...res });
    }
    const e = new UnauthorizedError('Unauthorized');
    return responseAsCometError(e);
  } catch (e) {
    if (isCometError(e)) return responseAsCometError(e);
    console.error(e);
    return responseAsCometError(new InternalError());
  }
};
