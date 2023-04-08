/// <reference types="@sveltejs/kit" />

import type { ErrorResponse } from '@types/globalmedia-comet';
// eslint-disable-next-line import/extensions
import { BadResponseError, FetchError } from '$lib/api/error';

interface ImportMetaEnv {
  VITE_BASE_URL: string;
}

/* Module */
export type ModuleDefinition = {
  module: string;
  iconComponent: unknown;
  actions?: Record<string, string>;
} & ModulePageDefinition;

export type ModulePageDefinition = {
  title: string;
  description: string;
  accessibleGroup: string;
  pages?: Record<string, ModulePageDefinition>;
};

export type ClientResponse<T> = T | ErrorResponse<FetchError | BadResponseError>;
