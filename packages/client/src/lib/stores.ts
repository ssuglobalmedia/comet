/* eslint-disable import/extensions */
// eslint-disable-next-line import/no-extraneous-dependencies
import {Readable, readable} from "svelte/store";
import type {UserInfo} from "types";
import {fetchWithAuth} from "$lib/utils";
import {variables} from "$lib/variables";

export const userInfo: Readable<UserInfo> = readable<UserInfo>(undefined, (set) => {
    fetchWithAuth(variables.baseUrl + '/api/module/auth/user/get')
        .then((res) => res.json())
        .then((info: UserInfo) => set(info))
        .catch((err) => console.error(err));
    return function stop() {
        set(undefined);
    }
});