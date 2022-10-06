<script>
  import { Column, Grid, Tile } from 'carbon-components-svelte';
  export let title;
  export let description;
</script>

<Tile>
  <h1>{title}</h1>
  <p>{description}</p>
  <div class="my-4">
    <slot />
    <Grid noGutter condensed>
      <Column style="display: flex; justify-content: end;">
        <slot name="navigation" />
      </Column>
    </Grid>
  </div>
</Tile>
