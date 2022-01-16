// eslint-disable-next-line import/no-extraneous-dependencies
import { SvelteComponent } from 'svelte';

/// <reference types="@sveltejs/kit" />
interface ImportMetaEnv {
	VITE_BASE_URL: string;
}

/* Module */
export type ModuleDefinition = {
	module: string;
	title: string;
	pictogram: typeof SvelteComponent;
	icon: typeof SvelteComponent;
	accessibleGroup: string;
	description: string;
};
