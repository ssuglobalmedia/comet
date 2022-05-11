import {callbackHandler} from './module/auth/handler/callback';
import {userGetHandler} from './module/auth/handler/user/get';
import {userUpdateHandler} from './module/auth/handler/user/update';
import {logoutHandler} from './module/auth/handler/logout';
import {userBatchPutHandler} from './module/auth/handler/user/batchPut';
import {userBatchDeleteHandler} from './module/auth/handler/user/batchDelete';
import {userQueryHandler} from './module/auth/handler/user/query';
import {rentalAddHandler} from './module/rental/handler/add';
import {rentalQueryHandler} from './module/rental/handler/query';
import {rentalUpdateHandler} from './module/rental/handler/update';
import {rentalRentHandler} from './module/rental/handler/rent';
import {rentalReturnHandler} from './module/rental/handler/return';
import {rentalDeleteHandler} from "./module/rental/handler/delete";

export const auth = {
  callbackHandler,
  logoutHandler,
  user: {
    userGetHandler,
    userUpdateHandler,
    userQueryHandler,
    userBatchPutHandler,
    userBatchDeleteHandler
  }
};

export const rental = {
  rentalAddHandler,
  rentalQueryHandler,
  rentalUpdateHandler,
  rentalDeleteHandler,
  rentalRentHandler,
  rentalReturnHandler
}
