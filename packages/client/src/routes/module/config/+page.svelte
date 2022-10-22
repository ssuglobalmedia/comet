<script lang='ts'>
  import { Button, RadioButton, RadioButtonGroup, TextInput } from 'carbon-components-svelte';
  import { Add16, Save16 } from 'carbon-icons-svelte';
  import LogFormatItem from '../../../components/atom/module/config/LogFormatItem.svelte';

  let webhookUrl = '';
  let webhookType = '';
  let logFormatArray = [];
  $: logFormats = Object.fromEntries(logFormatArray);

  $: isValid = logFormatArray.every(([moduleAction, logFormat]) => !!moduleAction);

  function addLogFormatItem() {
    logFormatArray = [...logFormatArray, ['', '']];
  }

  function deleteLogFormatItem(index: number) {
    logFormatArray.splice(index, 1);
    logFormatArray = [...logFormatArray];
  }

  function updateLogFormatItem(index: number, detail: [string, string]) {
    logFormatArray[index] = detail;
    logFormatArray = [...logFormatArray];
  }
</script>

<div class='flex mb-3 justify-between'>
  <h1>서비스 관리</h1>
  <Button class='transition-all' disabled={!isValid} icon={Save16}>저장</Button>
</div>

<h3>알림 웹후크</h3>
<TextInput class='mb-2' labelText='웹후크 주소' placeholder='웹후크 알림을 보낼 주소를 입력하세요...' bind:value={webhookUrl} />
<RadioButtonGroup
  legendText='웹후크 타입'
  placeholder='입력한 웹후크 주소의 타입을 선택하세요'
  bind:selected={webhookType}
>
  <RadioButton labelText='Microsoft Teams' value='teams' />
</RadioButtonGroup>
<div class='flex justify-start items-center my-2 gap-2'>
  <h3>로그 형식</h3>
  <Button icon={Add16} size='sm' on:click={addLogFormatItem}>포맷 추가</Button>
</div>
{#each logFormatArray as [moduleAction, logFormat], index}
  <LogFormatItem
    {moduleAction}
    {logFormat}
    on:delete={() => { deleteLogFormatItem(index)}}
    on:change={(data) => { updateLogFormatItem(index, data.detail)}}
  />
{/each}