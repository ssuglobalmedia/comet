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
  import { variables } from '$lib/variables';
  import { getCurrentSemester } from '$lib/utils';
  import { createEventDispatcher } from 'svelte';
  import { fetchWithAuth } from '$lib/api/common';

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
    fetchWithAuth(variables.baseUrl + '/api/module/auth/user/batch/put', {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        userEditedUserIds.map((v) => ({
          ...userMap[v],
          ...(includeUserGroup && { userGroup }),
          ...(includeLastSemester && { lastSemester }),
        })),
      ),
    })
      .then((res) => res.json())
      .then(() => {
        reqStatus = 'finished';
        dispatch('update', {});
        setTimeout(() => (open = false), 500);
      })
      .catch((e) => {
        reqStatus = 'error';
        console.error(e);
      });
  }
</script>

<ComposedModal bind:open on:submit={doUpdate} {...$$restProps}>
  <ModalHeader label="수정" title="사용자 일괄 수정" />
  <ModalBody hasForm>
    <TextArea
      labelText="선택한 사용자 목록"
      helperText="쉼표로 구분하여 학번을 추가할 수 있습니다."
      placeholder="학번을 입력하세요..."
      bind:value={userEditedUserIdTexts}
      invalid={invalidUserIds.length}
      invalidText={invalidUserIds.join(', ') + '을 찾을 수 없습니다.'} />
    <FormGroup legendText="구분">
      <div style="display:flex;">
        <Checkbox
          style="flex: 0 1 auto;"
          label="구분 포함하기"
          hideLabel
          bind:checked={includeUserGroup} />
        <Dropdown
          disabled={!includeUserGroup}
          style="flex: 1 0 auto;"
          items={groupDropdownItems}
          bind:selectedId={userGroup} />
      </div>
    </FormGroup>
    <FormGroup legendText="마지막 재학 학기">
      <div style="display:flex;">
        <Checkbox
          style="flex: 0 1 auto;"
          label="마지막 재학 학기 포함하기"
          hideLabel
          bind:checked={includeLastSemester} />
        <div style="flex: 1 0 auto;">
          <NumberInput
            disabled={!includeLastSemester}
            placeholder="재학 년도를 입력하세요..."
            bind:value={lastSemesterYear} />
          <ContentSwitcher bind:selectedIndex={lastSemesterNum}>
            <Switch disabled={!includeLastSemester} text="1학기" />
            <Switch disabled={!includeLastSemester} text="2학기" />
          </ContentSwitcher>
        </div>
      </div>
    </FormGroup>
  </ModalBody>
  <div
    style="display: flex; justify-content: end; padding-left: 0.825rem; padding-right: 0.825rem;">
    <div>
      {#if reqStatus === 'active'}
        <InlineLoading description="업데이트 중..." />
      {:else if reqStatus === 'finished'}
        <InlineLoading status="finished" description="잠시만 기다리시면 정보가 반영됩니다." />
      {:else if reqStatus === 'error'}
        <InlineLoading status="error" description="오류 발생" />
      {/if}
    </div>
  </div>
  <ModalFooter
    primaryButtonDisabled={(includeLastSemester && !lastSemesterYear) ||
      !userEditedUserIds.every((v) => userMap[v] !== undefined) ||
      (!includeLastSemester && !includeUserGroup) ||
      reqStatus !== 'pending'}
    primaryButtonText="수정" />
</ComposedModal>
