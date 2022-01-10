// eslint-disable-next-line import/no-extraneous-dependencies
import {Writable, writable} from "svelte/store";
import type {UserInfo} from "types";

export const userInfo: Writable<UserInfo> = writable<UserInfo>(undefined);