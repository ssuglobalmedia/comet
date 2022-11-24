<script lang='ts'>
  import "../app.postcss";
  import '../styles/app.scss';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  $: if (typeof window !== 'undefined') {
    document.documentElement.setAttribute('full', 'true');
    dispatch('update', { full: 'true' });
  }
</script>

<slot></slot>

<style lang="scss" global>
  html {
    inline-size: 100%;
    block-size: 100%;
    box-sizing: border-box;
    border-collapse: collapse;
  }

  .background {
    background-color: var(--cds-ui-background);
  }

  :root[full='true'] body {
    inline-size: 100%;
    block-size: 100%;
  }

  :root[full='true'] #svelte {
    inline-size: 100%;
    block-size: 100%;
  }

  .full {
    min-height: 100%;
    inline-size: 100%;
    block-size: 100%;
  }

  .inline-svg svg {
    display: inline;
    vertical-align: unset;
  }
</style>
