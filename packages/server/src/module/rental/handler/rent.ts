import type {APIGatewayProxyHandler} from "aws-lambda";
import {createResponse} from "../../../common";

export const rentHandler: APIGatewayProxyHandler = async (event) => {
  return createResponse(200, {
    success: true
  });
};