<script lang="ts">
  import type { Goods } from '@types/mirinae-comet';
  import {
    ComposedModal,
    Dropdown,
    FormGroup,
    InlineLoading,
    InlineNotification,
    ModalBody,
    ModalFooter,
    ModalHeader,
    TextInput,
  } from 'carbon-components-svelte';
  import { groupDisplayName } from '$lib/module/auth';
  import { createEventDispatcher } from 'svelte';
  import { apiGoodsUpdate } from '$lib/api/module/rental';

  export let open = false;
  export let reqStatus: 'pending' | 'active' | 'finished' | 'error' = 'pending';
  export let targetGoods: Goods = undefined;

  const dispatch = createEventDispatcher();

  const groupDropdownItems = Object.entries(groupDisplayName).map(([key, value]) => ({
    id: key,
    text: value,
  }));
  const groupIndex = {
    everyone: 0,
    certificated: 1,
    executive: 2,
    admin: 3,
  };

  const groupLevel = ['everyone', 'certificated', 'executive', 'admin'];

  function setupFirstValues() {
    reqStatus = 'pending';
    name = targetGoods.name;
    category = targetGoods.category;
    location = targetGoods.location;
    permission = targetGoods.permission;
  }

  $: if (targetGoods) setupFirstValues();

  let name;
  let category;
  let location = '';
  let permission;

  function doUpdate() {
    reqStatus = 'active';
    apiGoodsUpdate({
      id: targetGoods.id,
      ...(name !== targetGoods.name && { name }),
      ...(category !== targetGoods.category && { category }),
      ...(location !== targetGoods.location && { location }),
      ...(permission !== targetGoods.permission && { permission }),
    })
      .then((res) => {
        if(res.success) {
          reqStatus = 'finished';
          dispatch('update', {});
          setTimeout(() => (open = false), 500);
        } else {
          reqStatus = 'error';
          if(res.success === false) console.error(res.error);
        }
      })
      .catch((e) => {
        reqStatus = 'error';
        console.error(e);
      });
  }
</script>

<ComposedModal bind:open on:submit={doUpdate} {...$$restProps}>
  <ModalHeader label="??????" title={targetGoods?.name ?? '???????????? ??????'} />
  <ModalBody hasForm>
    {#if targetGoods}
      <FormGroup legendText="?????? ID">
        <p>{targetGoods.id}</p>
      </FormGroup>
      <TextInput labelText="?????????" placeholder="???????????? ???????????????..." bind:value={name} />
      <TextInput
        labelText="????????????"
        placeholder="??????????????? ???????????????..."
        bind:value={category} />
      <TextInput labelText="??????" placeholder="?????? ????????? ???????????????..." bind:value={location} />
      <Dropdown
        titleText="?????? ?????? ?????????"
        items={groupDropdownItems}
        bind:selectedId={permission} />
    {:else}
      <InlineNotification
        hideCloseButton
        lowContrast
        kind="error"
        title="??????:"
        subtitle="????????? ????????? ????????????." />
    {/if}
  </ModalBody>
  <div
    style="display: flex; justify-content: end; padding-left: 0.825rem; padding-right: 0.825rem;">
    <div>
      {#if reqStatus === 'active'}
        <InlineLoading description="???????????? ???..." />
      {:else if reqStatus === 'finished'}
        <InlineLoading status="finished" description="?????? ??? ????????? ???????????????." />
      {:else if reqStatus === 'error'}
        <InlineLoading status="error" description="?????? ??????" />
      {/if}
    </div>
  </div>
  <ModalFooter
    primaryButtonDisabled={!name || !category || !permission || reqStatus !== 'pending'}
    primaryButtonText="??????" />
</ComposedModal>
