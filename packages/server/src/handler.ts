import { handler as callbackHandler } from './module/auth/handler/callback';
import { handler as getUserInfoHandler } from './module/auth/handler/user/get';
import { handler as updateUserInfoHandler } from './module/auth/handler/user/update';

export const auth = {
	callbackHandler,
	user: {
		getUserInfoHandler,
		updateUserInfoHandler
	}
};
