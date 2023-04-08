<script lang='ts'>
  import type { Log } from 'globalmedia-comet';
  import { AccordionItem, Tag } from 'carbon-components-svelte';
  import { getModuleActionDisplay, logFieldDisplay } from '$lib/module/log';
  import { Categories16, Time16 } from 'carbon-icons-svelte';
  import { marked } from 'marked';
  import DOMPurify from 'dompurify';
  import { browser } from '$app/environment';

  export let log: Log;
  export let format: string;
  let moduleDisplay;
  let actionDisplay;
  const dateFormatter = new Intl.DateTimeFormat('ko', { dateStyle: 'short', timeStyle: 'short' });
  $: dateDisplay = log?.date instanceof Date ? dateFormatter.format(log.date) : undefined;
  $: if (log) {
    const display = getModuleActionDisplay(log.module, log.action);
    moduleDisplay = display.module;
    actionDisplay = display.action;
  }

  function formatLog(format: string, log: Log): string {
    const baseData = {
      userId: log.userId,
      userName: log.userName,
      target: log.target
    };
    const data = {
      ...baseData,
      ...JSON.parse(log.data) as Record<string, string>
    };
    return Object.entries(data).reduce((str, [key, value]) => {
      if(str.includes(`$\{date(${key})\}`)) {
        const formatter = new Intl.DateTimeFormat('ko', { dateStyle: 'short', timeStyle: 'short'});
        const date = new Date(value);
        return str.replace(`$\{date(${key})\}`, formatter.format(date));
      }
      return str.replace(`$\{${key}\}`, value);
    }, format);
  }
</script>

<AccordionItem>
  <svelte:fragment slot='title'>
    <p>
      <Tag icon={Time16}>{dateDisplay}</Tag>
      <Tag icon={Categories16} type='outline'>{moduleDisplay} / {actionDisplay}</Tag>
    </p>
    {#if browser && format}
      <p>{@html DOMPurify.sanitize(marked.parse(formatLog(format, log)))}</p>
    {/if}
  </svelte:fragment>
  <div class='flex gap-4 flex-wrap'>
    {#each Object.entries(log) as [key, value]}
      <div>
        <p class='bx--label'>{logFieldDisplay[key]}</p>
        <p><code>{value}</code></p>
      </div>
    {/each}
  </div>
</AccordionItem>