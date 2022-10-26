<script lang="ts">
  import { CodeSnippet, Column, Grid, Row, TextAreaSkeleton } from 'carbon-components-svelte';
  import type { Log, CometResponse, CometError } from 'mirinae-comet';
  import { variables } from '$lib/variables';
  import { browser } from '$app/environment';
  import { fetchWithAuth } from '$lib/api/common';

  let logs: Array<Log> = undefined;

  if (browser) {
    updateLogs();
  }

  function updateLogs() {
    logs = undefined;
    fetchWithAuth(`${variables.baseUrl as string}/api/module/log/query`)
      .then((res) => res.json())
      .then((res: CometResponse<Array<Log>, CometError>) => {
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
