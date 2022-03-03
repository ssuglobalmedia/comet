import { callbackHandler } from './module/auth/handler/callback';
import { userGetHandler } from './module/auth/handler/user/get';
import { userUpdateHandler } from './module/auth/handler/user/update';
import { logoutHandler } from './module/auth/handler/logout';
import {userAllHandler} from "./module/auth/handler/user/all";
import {batchPutHandler} from "./module/auth/handler/user/batchPut";
import {batchDeleteHandler} from "./module/auth/handler/user/batchDelete";
import {batchUpdateHandler} from "./module/auth/handler/user/batchUpdate";

export const auth = {
	callbackHandler,
	logoutHandler,
	user: {
		userGetHandler,
		userUpdateHandler,
		userAllHandler,
		batchPutHandler,
		batchDeleteHandler,
		batchUpdateHandler
	}
};
