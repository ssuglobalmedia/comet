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
  import { fetchWithAuth, groupDisplayName } from '$lib/module/auth';
  import { variables } from '$lib/variables';
  import { createEventDispatcher } from 'svelte';

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
    fetchWithAuth(variables.baseUrl + '/api/module/rental/add', {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: targetGoods.id,
        ...(name !== targetGoods.name && { name }),
        ...(category !== targetGoods.category && { category }),
        ...(location !== targetGoods.location && { location }),
        ...(permission !== targetGoods.permission && { permission }),
      }),
    })
      .then((res) => res.json())
      .then(() => {
        reqStatus = 'finished';
        setTimeout(() => (open = false), 500);
        dispatch('success', {});
      })
      .catch((e) => {
        reqStatus = 'error';
        console.error(e);
      });
  }
</script>

<ComposedModal bind:open on:submit={doUpdate} {...$$restProps}>
  <ModalHeader label="수정" title={targetGoods?.name ?? '대여물품 수정'} />
  <ModalBody hasForm>
    {#if targetGoods}
      <FormGroup legendText="물품 ID">
        <p>{targetGoods.id}</p>
      </FormGroup>
      <TextInput labelText="물품명" placeholder="물품명을 입력하세요..." bind:value={name} />
      <TextInput
        labelText="카테고리"
        placeholder="카테고리를 입력하세요..."
        bind:value={category} />
      <TextInput labelText="위치" placeholder="물품 위치를 입력하세요..." bind:value={location} />
      <Dropdown
        titleText="대여 가능 사용자"
        items={groupDropdownItems}
        bind:selectedId={permission} />
    {:else}
      <InlineNotification
        hideCloseButton
        lowContrast
        kind="error"
        title="오류:"
        subtitle="선택된 물품이 없습니다." />
    {/if}
  </ModalBody>
  <div
    style="display: flex; justify-content: end; padding-left: 0.825rem; padding-right: 0.825rem;">
    <div>
      {#if reqStatus === 'active'}
        <InlineLoading description="업데이트 중..." />
      {:else if reqStatus === 'finished'}
        <InlineLoading status="finished" description="잠시 후 정보가 반영됩니다." />
      {:else if reqStatus === 'error'}
        <InlineLoading status="error" description="오류 발생" />
      {/if}
    </div>
  </div>
  <ModalFooter
    primaryButtonDisabled={!name || !category || !permission || reqStatus !== 'pending'}
    primaryButtonText="수정" />
</ComposedModal>
