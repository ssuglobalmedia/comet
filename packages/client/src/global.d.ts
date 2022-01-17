// eslint-disable-next-line import/no-extraneous-dependencies
import { SvelteComponent } from 'svelte';

/// <reference types="@sveltejs/kit" />
interface ImportMetaEnv {
	VITE_BASE_URL: string;
}

/* Module */
export type ModuleDefinition = {
	module: string;
} & ModulePageDefinition;

export type ModulePageDefinition = {
	title: string;
	description: string;
	accessibleGroup: string;
	pages?: Record<string, ModulePageDefinition>;
};
