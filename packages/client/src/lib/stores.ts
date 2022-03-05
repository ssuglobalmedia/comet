/* eslint-disable import/extensions */
// eslint-disable-next-line import/no-extraneous-dependencies
import { readable } from 'svelte/store';
import type { Readable } from 'svelte/store';
import type { CometResponse, User } from 'mirinae-comet';
import { fetchWithAuth } from '$lib/module/auth';
import { variables } from '$lib/variables';
import { browser } from '$app/env';

export const userInfo: Readable<User> = readable<User>(undefined, (set) => {
	if (browser) {
		set(undefined);
		fetchWithAuth(`${variables.baseUrl as string}/api/module/auth/user/get`)
			.then((res) => res.json())
			.then((res: CometResponse) => {
				if (res.success) {
					return res.result as User;
				}
				throw new Error(`Request error ${res.error}: ${res.error_description}`);
			})
			.then((info: User) => set(info))
			.catch((err) => {
				console.error(err);
				set(null);
			});
	}
	return function stop() {
		set(undefined);
	};
});
