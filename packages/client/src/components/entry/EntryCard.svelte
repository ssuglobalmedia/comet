<script>
    import {ImageLoader, Tile} from "carbon-components-svelte";
</script>

<Tile light style="padding: 0px;">
    <div class="p-5">
        <ImageLoader src="/mirinae.png" class="logo-img my-4"/>
        <h1 class="mb-1">COMET</h1>
        <p class="type-mono mb-9">Combination of Operation and Management Engaging Tools</p>
        <slot />
    </div>
</Tile>

<style lang="scss">
  @import 'src/styles/spacing-utils';
  :global(.logo-img) {
    max-width: 140px;
    filter: unquote('invert()');
  }

  :global(.type-mono) {
    @include type-style('code-01');
  }
</style>