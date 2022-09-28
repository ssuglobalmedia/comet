/* eslint-disable import/extensions */
// eslint-disable-next-line import/no-extraneous-dependencies
import { readable } from 'svelte/store';
import type { Readable } from 'svelte/store';
import type { CometError, CometResponse, User } from 'mirinae-comet';
import { fetchWithAuth, getAuthorization } from '$lib/module/auth';
import { variables } from '$lib/variables';
import { browser } from '$app/environment';

export const userInfo: Readable<User> = readable<User>(undefined, (set) => {
  if (browser) {
    set(undefined);
    if (getAuthorization()) {
      fetchWithAuth(`${variables.baseUrl as string}/api/module/auth/user/get`)
        .then((res) => res.json())
        .then((res: CometResponse<User, CometError>) => {
          if (res.success) {
            return res.result;
          } else if (res.success === false) {
            throw new Error(`Request error ${res.error.name}: ${res.error.message}`);
          }
        })
        .then((info: User) => set(info))
        .catch((err) => {
          console.error(err);
          set(null);
        });
    } else {
      set(null);
    }
  }
  return function stop() {
    set(undefined);
  };
});
