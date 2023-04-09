/* eslint-disable import/extensions */
// eslint-disable-next-line import/no-extraneous-dependencies
import { readable } from 'svelte/store';
import type { Readable } from 'svelte/store';
import type { User } from 'globalmedia-comet';
import { getAuthorization } from '$lib/module/auth';
import { browser } from '$app/environment';
import { apiUserGet } from '$lib/api/module/auth';

export const userInfo: Readable<User> = readable<User>(undefined, (set) => {
  if (browser) {
    set(undefined);
    if (getAuthorization()) {
      apiUserGet()
        .then((res) => {
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
