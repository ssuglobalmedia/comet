<script lang="ts">
  import type { User } from '@types/mirinae-comet';
  import {
    Checkbox,
    ComposedModal,
    ContentSwitcher,
    Dropdown,
    FormGroup,
    InlineLoading,
    ModalBody,
    ModalFooter,
    ModalHeader,
    NumberInput,
    Switch,
    TextArea,
  } from 'carbon-components-svelte';
  import { groupDisplayName } from '$lib/module/auth';
  import { getCurrentSemester } from '$lib/utils';
  import { createEventDispatcher } from 'svelte';
  import { apiUserBatchPut } from '$lib/api/module/auth';

  export let open = false;

  export let userSupplier: Array<User> = [];
  $: userMap = Object.fromEntries((userSupplier ?? []).map((v) => [v.userId, v]));
  export let selectedUserIds: Array<string> = [];
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

  const dispatch = createEventDispatcher();

  let includeUserGroup = false;
  let includeLastSemester = false;

  let userEditedUserIdTexts;
  let userEditedUserIds;
  let userGroup = 'everyone';
  let lastSemesterYear = new Date().getFullYear();
  let lastSemesterNum = getCurrentSemester() - 1;
  function setupFirstValues() {
    reqStatus = 'pending';
    userEditedUserIdTexts = selectedUserIds.join(', ');
    userEditedUserIds = [...selectedUserIds];
  }

  $: lastSemester = `${lastSemesterYear}-${lastSemesterNum + 1}`;
  $: userEditedUserIds = (userEditedUserIdTexts ?? '').split(',').map((v) => v.trim());
  $: invalidUserIds = userEditedUserIds.filter((v) => userMap[v] === undefined);
  export let reqStatus: 'pending' | 'active' | 'finished' | 'error' = 'pending';
  $: if (selectedUserIds) {
    setupFirstValues();
  }

  function doUpdate() {
    reqStatus = 'active';
    apiUserBatchPut(userEditedUserIds.map((v) => ({
      ...userMap[v],
      ...(includeUserGroup && { userGroup }),
      ...(includeLastSemester && { lastSemester }),
    })))
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
  <ModalHeader label="??????" title="????????? ?????? ??????" />
  <ModalBody hasForm>
    <TextArea
      labelText="????????? ????????? ??????"
      helperText="????????? ???????????? ????????? ????????? ??? ????????????."
      placeholder="????????? ???????????????..."
      bind:value={userEditedUserIdTexts}
      invalid={invalidUserIds.length}
      invalidText={invalidUserIds.join(', ') + '??? ?????? ??? ????????????.'} />
    <FormGroup legendText="??????">
      <div style="display:flex;">
        <Checkbox
          style="flex: 0 1 auto;"
          label="?????? ????????????"
          hideLabel
          bind:checked={includeUserGroup} />
        <Dropdown
          disabled={!includeUserGroup}
          style="flex: 1 0 auto;"
          items={groupDropdownItems}
          bind:selectedId={userGroup} />
      </div>
    </FormGroup>
    <FormGroup legendText="????????? ?????? ??????">
      <div style="display:flex;">
        <Checkbox
          style="flex: 0 1 auto;"
          label="????????? ?????? ?????? ????????????"
          hideLabel
          bind:checked={includeLastSemester} />
        <div style="flex: 1 0 auto;">
          <NumberInput
            disabled={!includeLastSemester}
            placeholder="?????? ????????? ???????????????..."
            bind:value={lastSemesterYear} />
          <ContentSwitcher bind:selectedIndex={lastSemesterNum}>
            <Switch disabled={!includeLastSemester} text="1??????" />
            <Switch disabled={!includeLastSemester} text="2??????" />
          </ContentSwitcher>
        </div>
      </div>
    </FormGroup>
  </ModalBody>
  <div
    style="display: flex; justify-content: end; padding-left: 0.825rem; padding-right: 0.825rem;">
    <div>
      {#if reqStatus === 'active'}
        <InlineLoading description="???????????? ???..." />
      {:else if reqStatus === 'finished'}
        <InlineLoading status="finished" description="????????? ??????????????? ????????? ???????????????." />
      {:else if reqStatus === 'error'}
        <InlineLoading status="error" description="?????? ??????" />
      {/if}
    </div>
  </div>
  <ModalFooter
    primaryButtonDisabled={(includeLastSemester && !lastSemesterYear) ||
      !userEditedUserIds.every((v) => userMap[v] !== undefined) ||
      (!includeLastSemester && !includeUserGroup) ||
      reqStatus !== 'pending'}
    primaryButtonText="??????" />
</ComposedModal>
