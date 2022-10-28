<script lang="ts">
  import {
    ComposedModal,
    Dropdown,
    InlineLoading,
    ModalBody,
    ModalFooter,
    ModalHeader,
    TextInput,
  } from 'carbon-components-svelte';
  import { groupDisplayName } from '$lib/module/auth';
  import { createEventDispatcher } from 'svelte';
  import { apiGoodsAdd } from '$lib/api/module/rental';

  export let open = false;
  export let reqStatus: 'pending' | 'active' | 'finished' | 'error' = 'pending';

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

  $: if (open) {
    reqStatus = 'pending';
  }

  let goodsId;
  let name;
  let category;
  let location = '';
  let permission = 'everyone';

  function doAdd() {
    reqStatus = 'active';
    apiGoodsAdd({
      id: goodsId,
      name,
      category,
      location,
      permission: permission,
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

<ComposedModal bind:open on:submit={doAdd} {...$$restProps}>
  <ModalHeader label="추가" title="대여물품 추가" />
  <ModalBody hasForm>
    <TextInput
      labelText="물품 ID"
      placeholder="물품 ID를 입력하세요..."
      helperText="알파벳(a-Z)와 언더스코어(_)만 허용됩니다."
      bind:value={goodsId} />
    <TextInput labelText="물품명" placeholder="물품명을 입력하세요..." bind:value={name} />
    <TextInput labelText="카테고리" placeholder="카테고리를 입력하세요..." bind:value={category} />
    <TextInput labelText="위치" placeholder="물품의 위치를 입력하세요..." bind:value={location} />
    <Dropdown
      titleText="대여 가능 사용자"
      items={groupDropdownItems}
      bind:selectedId={permission} />
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
    primaryButtonDisabled={!goodsId || !name || !category || !permission || reqStatus !== 'pending'}
    primaryButtonText="추가" />
</ComposedModal>
