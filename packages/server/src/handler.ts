import { callbackHandler } from './module/auth/handler/callback';
import { userGetHandler } from './module/auth/handler/user/get';
import { userUpdateHandler } from './module/auth/handler/user/update';
import { logoutHandler } from './module/auth/handler/logout';

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
