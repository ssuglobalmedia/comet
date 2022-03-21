import { callbackHandler } from './module/auth/handler/callback';
import { userGetHandler } from './module/auth/handler/user/get';
import { userUpdateHandler } from './module/auth/handler/user/update';
import { logoutHandler } from './module/auth/handler/logout';
import { userBatchPutHandler } from './module/auth/handler/user/batchPut';
import { userBatchDeleteHandler } from './module/auth/handler/user/batchDelete';
import { userQueryHandler } from './module/auth/handler/user/query';
import { rentalAddHandler } from './module/rental/handler/add';
import { rentalGetHandler } from './module/rental/handler/get';
import { rentalUpdateHandler } from './module/rental/handler/update';
import { rentalRemoveHandler } from './module/rental/handler/remove';
import { rentalRentHandler } from './module/rental/handler/rent';
import { rentalReturnHandler } from './module/rental/handler/return';

export const auth = {
	callbackHandler,
	logoutHandler,
	user: {
		userGetHandler,
		userUpdateHandler,
		userQueryHandler,
		userBatchPutHandler,
		userBatchDeleteHandler
	},
	rental: {
		rentalCreateHandler: rentalAddHandler,
		rentalGetHandler,
		rentalUpdateHandler,
		rentalDeleteHandler: rentalRemoveHandler,
		rentalRentHandler,
		rentalReturnHandler
	}
};
