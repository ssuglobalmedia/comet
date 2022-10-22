<script lang='ts'>
  import { Button, TextInput } from 'carbon-components-svelte';
  import { Subtract16 } from 'carbon-icons-svelte';
  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher();

  export let moduleAction;
  export let logFormat;
  let moduleName;
  let action;
  onMount(() => {
    moduleName = moduleAction.split('.')?.[0];
    action = moduleAction.split('.')?.[1];
  });

  $: if(moduleName && action) {
    moduleAction = `${moduleName}.${action}`;
  }

  $: {
    dispatch('change', [moduleAction, logFormat]);
  }

  function deleteItem() {
    dispatch('delete', {});
  }
</script>

<div class='flex flex-col gap-2'>
  <hr class='text-gray-70' />
  <div class='flex gap-1 self-start'>
    <TextInput placeholder='모듈 이름' bind:value={moduleName} />
    <TextInput placeholder='액션 이름' bind:value={action} />
  </div>
  <div class='flex gap-2'>
    <div class='grow'>
      <TextInput placeholder='로그 형식을 입력하세요...' bind:value={logFormat} />
    </div>
    <div>
      <Button kind='danger' iconDescription='제거' icon={Subtract16} size='field' on:click={deleteItem} />
    </div>
  </div>
</div>