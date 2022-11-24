<script lang='ts'>
  import { Accordion, PaginationSkeleton, Tile } from 'carbon-components-svelte';
  import type { Log } from 'mirinae-comet';
  import { browser } from '$app/environment';
  import { apiLogQuery } from '$lib/api/module/log';
  import { apiConfigGet } from '$lib/api/module/config';
  import LogItem from '$lib/components/atom/module/log/LogItem.svelte';
  import PaginationKor from '$lib/components/atom/PaginationKor.svelte';

  let logFormats: Record<string, string> = undefined;

  let logs: Array<Log> = undefined;
  let page = 1;
  let pageSize = 10;
  $: start = pageSize * (page - 1);
  $: displayedLogs = logs?.slice(start, start + pageSize) ?? [];

  if (browser) {
    updateLogs();
  }

  function updateLogs() {
    logs = undefined;
    page = 1;
    apiConfigGet()
      .then(res => {
        if (res.success === false)
          throw new Error(`Request error ${res.error.name}: ${res.error.message}`);
        if (res.success) logFormats = res.result.logFormat;
      })
      .catch((err) => {
        console.error(err);
      });
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

<h1>관리 기록</h1>
{#if logs}
  <Accordion>
    {#each displayedLogs as log}
      <LogItem {log} format={logFormats?.[`${log.module}_${log.action}`]} />
    {:else}
      <Tile>아무런 기록도 없습니다.</Tile>
    {/each}
  </Accordion>
  <PaginationKor totalItems={logs.length} pageSizes={[10, 20, 100]} bind:page bind:pageSize />
{:else}
  <Accordion skeleton open={false} />
  <PaginationSkeleton />
{/if}

<style>
</style>
