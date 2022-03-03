import { callbackHandler } from './module/auth/handler/callback';
import { userGetHandler } from './module/auth/handler/user/get';
import { userUpdateHandler } from './module/auth/handler/user/update';
import { logoutHandler } from './module/auth/handler/logout';
import { userBatchPutHandler } from './module/auth/handler/user/batchPut';
import { userBatchDeleteHandler } from './module/auth/handler/user/batchDelete';
import { userQueryHandler } from './module/auth/handler/user/query';

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
