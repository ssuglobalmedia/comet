<script lang='ts'>
  import {
    Button, Checkbox, FormGroup,
    RadioButton,
    RadioButtonGroup, RadioButtonSkeleton,
    SkeletonText,
    TextInput,
    TextInputSkeleton, TooltipDefinition,
  } from 'carbon-components-svelte';
  import { Add16, Save16 } from 'carbon-icons-svelte';
  import LogFormatItem from '../../../lib/components/atom/module/config/LogFormatItem.svelte';
  import { onMount } from 'svelte';
  import { apiConfigGet, apiConfigUpdate } from '$lib/api/module/config';

  let response;
  let webhookUrl = '';
  let webhookType = '';
  let webhookActions = [];
  let logFormatArray = [];
  $: logFormats = Object.fromEntries(logFormatArray);

  $: isValid = logFormatArray.every(([moduleAction, logFormat]) => !!moduleAction);

  $: if (response && response.success) {
    const { rentalWebhook, logFormat } = response.result;
    if (rentalWebhook) {
      webhookUrl = rentalWebhook.url ?? '';
      webhookType = rentalWebhook.type ?? '';
      webhookActions = rentalWebhook.actions ?? [];
    }
    logFormatArray = Object.entries(logFormat);
  }
  onMount(async () => {
    response = await apiConfigGet();
  });

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

  function updateConfig() {
    response = undefined;
    apiConfigUpdate({
      ...(webhookType && webhookUrl && webhookActions && { rentalWebhook: { url: webhookUrl, type: webhookType, actions: webhookActions } }),
      logFormat: logFormats,
    }).then((res) => {
      console.log(res);
      apiConfigGet().then(res => response = res)
    });
  }
</script>

<div class='flex mb-3 justify-between'>
  <h1>서비스 관리</h1>
  <Button class='transition-all' disabled={!isValid} icon={Save16} on:click={updateConfig}
          skeleton={!(!!response && response.success)}>저장
  </Button>
</div>
{#if response && response.success}
  <section>
    <h3>알림 웹후크</h3>
    <TextInput class='mb-2' labelText='웹후크 주소' placeholder='웹후크 알림을 보낼 주소를 입력하세요...' bind:value={webhookUrl} />
    <RadioButtonGroup
      legendText='웹후크 타입'
      placeholder='입력한 웹후크 주소의 타입을 선택하세요'
      bind:selected={webhookType}
    >
      <RadioButton labelText='Microsoft Teams' value='teams' />
    </RadioButtonGroup>
    <FormGroup legendText='웹후크 발송 대상'>
      <Checkbox bind:group={webhookActions} value='rental_rent'>
        <svelte:fragment slot='labelText'>
          <TooltipDefinition
            tooltipText="물품 대여 시 알림을 발송합니다."
          >
            물품 대여 / 대여
          </TooltipDefinition>
        </svelte:fragment>
      </Checkbox>
      <Checkbox bind:group={webhookActions} value='rental_return'>
        <svelte:fragment slot='labelText'>
          <TooltipDefinition
            tooltipText="물품 반납 시 알림을 발송합니다."
          >
            물품 대여 / 반납
          </TooltipDefinition>
        </svelte:fragment>
      </Checkbox>
      <Checkbox bind:group={webhookActions} value='rental_late'>
        <svelte:fragment slot='labelText'>
          <TooltipDefinition
            tooltipText="물품이 제 시간에 반납되지 않았을 경우 알림을 발송합니다. 매일 6시에 알림을 발송합니다."
          >
            물품 대여 / 반납 지연
          </TooltipDefinition>
        </svelte:fragment>
      </Checkbox>
    </FormGroup>
  </section>
  <section>
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
  </section>
{:else}
  <SkeletonText heading />
  <TextInputSkeleton class='mb-2' />
  <RadioButtonGroup
    legendText='웹후크 타입'
    placeholder='입력한 웹후크 주소의 타입을 선택하세요'
  >
    <RadioButtonSkeleton />
  </RadioButtonGroup>
  <SkeletonText heading class='my-2' />
  <SkeletonText />
{/if}