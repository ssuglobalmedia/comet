<script lang="ts">
  import type { User } from '@types/mirinae-comet';
  import {
    ComposedModal,
    ContentSwitcher,
    Dropdown,
    FormGroup,
    InlineLoading,
    InlineNotification,
    ModalBody,
    ModalFooter,
    ModalHeader,
    NumberInput,
    Switch,
    TextInput,
  } from 'carbon-components-svelte';
  import { groupDisplayName } from '$lib/module/auth';
  import { createEventDispatcher } from 'svelte';
  import { apiUserUpdate } from '$lib/api/module/auth';

  export let open = false;

  export let targetUser: User = undefined;
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

  let userName;
  let userGroup;
  let phone: string;
  let lastSemesterYear;
  let lastSemesterNum;
  export let reqStatus: 'pending' | 'active' | 'finished' | 'error' = 'pending';

  const dispatch = createEventDispatcher();

  function setupFirstValues() {
    reqStatus = 'pending';
    userName = targetUser.userName;
    userGroup = targetUser.userGroup;
    phone = targetUser.phone;
    lastSemesterYear = targetUser.lastSemester
      ? parseInt(targetUser.lastSemester.split('-')[0])
      : undefined;
    lastSemesterNum = targetUser.lastSemester
      ? parseInt(targetUser.lastSemester.split('-')[1]) - 1
      : undefined;
  }

  $: if (targetUser) setupFirstValues();

  function doUpdate() {
    reqStatus = 'active';
    apiUserUpdate({
      userId: targetUser.userId,
      ...(userName !== targetUser.userName && { userName }),
      ...(userGroup !== targetUser.userGroup && { userGroup }),
      ...(phone !== targetUser.phone && { phone: phone.replace(/\D/g, '') }),
      ...(lastSemesterYear &&
        `${lastSemesterYear}-${lastSemesterNum + 1}` !== targetUser.lastSemester && {
          lastSemester: `${lastSemesterYear}-${lastSemesterNum + 1}`,
        }),
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
  <ModalHeader label="??????" title="????????? ??????" />
  <ModalBody hasForm>
    {#if targetUser}
      <FormGroup legendText="??????">
        <p>{targetUser.userId}</p>
      </FormGroup>
      <TextInput labelText="????????? ??????" placeholder="????????? ???????????????..." bind:value={userName} />
      <Dropdown titleText="??????" items={groupDropdownItems} bind:selectedId={userGroup} />
      <TextInput
        labelText="????????????"
        placeholder="??????????????? ???????????????..."
        helperText="????????? ?????? ?????? ???????????? ???????????????."
        bind:value={phone} />
      <NumberInput
        label="????????? ?????? ??????"
        placeholder="?????? ????????? ???????????????..."
        bind:value={lastSemesterYear} />
      <ContentSwitcher bind:selectedIndex={lastSemesterNum}>
        <Switch text="1??????" />
        <Switch text="2??????" />
      </ContentSwitcher>
    {:else}
      <InlineNotification
        hideCloseButton
        lowContrast
        kind="error"
        title="??????:"
        subtitle="????????? ???????????? ????????????." />
    {/if}
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
    primaryButtonDisabled={(!userName &&
      targetUser &&
      (userName !== targetUser.userName ||
        userGroup !== targetUser.userGroup ||
        phone !== targetUser.phone ||
        (!targetUser.lastSemester && lastSemesterYear) ||
        (targetUser.lastSemester &&
          targetUser.lastSemester !== `${lastSemesterYear}-${lastSemesterNum + 1}`))) ||
      reqStatus !== 'pending'}
    primaryButtonText="??????" />
</ComposedModal>
