<script lang="ts">
  import { CodeSnippet, Column, Grid, Row, TextAreaSkeleton } from 'carbon-components-svelte';
  import type { Log } from 'mirinae-comet';
  import { browser } from '$app/environment';
  import { apiLogQuery } from '$lib/api/module/log';

  let logs: Array<Log> = undefined;

  if (browser) {
    updateLogs();
  }

  function updateLogs() {
    logs = undefined;
    apiLogQuery()
      .then((res) => {
        if (res.success === false)
          throw new Error(`Request error ${res.error.name}: ${res.error.message}`);
        if (res.success) logs = res.result;
      })
      .catch((err) => {
        console.error(err);
      });
  }
</script>

<Grid>
  <Row>
    <Column>준비 중입니다.</Column>
  </Row>
  <Row>
    {#if logs}
      <CodeSnippet type="multi" code={JSON.stringify(logs)} />
    {:else}
      <TextAreaSkeleton hideLabel />
    {/if}
  </Row>
</Grid>

<style>
</style>
