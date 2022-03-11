import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import { optimizeImports } from 'carbon-preprocess-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors

	kit: {
		prerender: {
			default: true
		},
		adapter: adapter({
			pages: 'build',
			assets: 'build'
		}),

		vite: {
			css: {
				preprocessorOptions: {
					scss: {
						additionalData: '@use "src/styles/variables.scss" as *;'
					}
				}
			}
		}
	},

	preprocess: [
		preprocess({
			scss: {
				prependData: '@use "src/styles/variables.scss" as *;'
			}
		}),
		optimizeImports()
	]
};

export default config;
