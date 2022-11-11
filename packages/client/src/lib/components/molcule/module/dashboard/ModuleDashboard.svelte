<script lang="ts">
  import type { ModuleDefinition } from '../../../../../global';
  import { ClickableTile, Column, Grid, Row } from 'carbon-components-svelte';
  import { isAccessible, groupDisplayName } from '$lib/module/auth';
  import { userInfo } from '$lib/stores';

  export let modules: Record<string, ModuleDefinition>;

  let modulesByGroup = Object.entries(modules).reduce<Record<string, ModuleDefinition[]>>(
    (map, value) => {
      const groupMembers = map[value[1].accessibleGroup] ?? [];
      let ret = { ...map };
      ret[value[1].accessibleGroup] = [...groupMembers, value[1]];
      return ret;
    },
    {},
  );
</script>

<Grid noGutter narrow>
  {#each Object.entries(modulesByGroup) as [group, modules]}
    {#if isAccessible($userInfo, group)}
      <Row>
        <Column>
          <h1>{groupDisplayName[group]}</h1>
          <Grid noGutter narrow>
            <Row>
              {#each modules as module}
                <Column>
                  <ClickableTile href="/module/{module.module}" class="my-4">
                    <svelte:component this={module.iconComponent} />
                    <h2>{module.title}</h2>
                    <p>{module.description}</p>
                  </ClickableTile>
                </Column>
              {/each}
            </Row>
          </Grid>
        </Column>
      </Row>
    {/if}
  {/each}
</Grid>
