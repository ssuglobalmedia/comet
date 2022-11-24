import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import { optimizeImports } from 'carbon-preprocess-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors

  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
    }),
  },

  preprocess: [
    preprocess({
      scss: {
        prependData: '@use "src/styles/variables.scss" as *;',
      },

      postcss: true,
    }),
    optimizeImports(),
  ],
};

export default config;
