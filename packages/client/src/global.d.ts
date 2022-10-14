/// <reference types="@sveltejs/kit" />

interface ImportMetaEnv {
  VITE_BASE_URL: string;
}

/* Module */
export type ModuleDefinition = {
  module: string;
  iconComponent: unknown;
} & ModulePageDefinition;

export type ModulePageDefinition = {
  title: string;
  description: string;
  accessibleGroup: string;
  pages?: Record<string, ModulePageDefinition>;
};
