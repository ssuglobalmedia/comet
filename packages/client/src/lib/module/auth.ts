/* eslint-disable import/extensions */
import { getCookieValue } from '$lib/utils';
import type { User } from 'mirinae-comet';

export const getAuthorization = () => getCookieValue('comet_session');

export const fetchWithAuth = (resource: RequestInfo, init?: RequestInit) =>
  fetch(resource, {
    ...init,
    headers: {
      Authorization: `Bearer ${getAuthorization()}`,
      ...init?.headers,
    },
  });

export function isAccessible(user: User, group: string): boolean {
  const permissionLevel = {
    everyone: 0,
    certificated: 1,
    executive: 2,
    admin: 3,
  };
  if (permissionLevel[group] === undefined) return false;
  return permissionLevel[user.userGroup] >= permissionLevel[group];
}

export const groupDisplayName = {
  everyone: '학부생 (미납자)',
  certificated: '학부생 (납부자)',
  executive: '집행부원',
  admin: '관리자',
};
