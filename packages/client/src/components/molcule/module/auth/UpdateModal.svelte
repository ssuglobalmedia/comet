<script lang="ts">
  import type { User } from "@types/mirinae-comet";
  import {
    ComposedModal, ContentSwitcher,
    Dropdown,
    FormGroup, InlineLoading,
    InlineNotification, ModalBody, ModalFooter, ModalHeader,
    NumberInput, Switch,
    TextInput
  } from "carbon-components-svelte";
  import { fetchWithAuth, groupDisplayName } from "$lib/module/auth";
  import { variables } from "$lib/variables";

  export let open = false;

  export let targetUser: User = undefined;
  const groupDropdownItems = Object.entries(groupDisplayName).map(([key, value]) => ({ id: key, text: value }));
  const groupIndex = {
    everyone: 0,
    certificated: 1,
    executive: 2,
    admin: 3
  };

  let userName;
  let userGroup;
  let phone: string;
  let lastSemesterYear;
  let lastSemesterNum;
  export let reqStatus: "pending" | "active" | "finished" | "error" = "pending";

  function setupFirstValues() {
    reqStatus = "pending";
    userName = targetUser.userName;
    userGroup = targetUser.userGroup;
    phone = targetUser.phone;
    lastSemesterYear = targetUser.lastSemester ? parseInt(targetUser.lastSemester.split("-")[0]) : undefined;
    lastSemesterNum = targetUser.lastSemester ? parseInt(targetUser.lastSemester.split("-")[1]) - 1 : undefined;
  }

  $: if (targetUser) setupFirstValues();

  function doUpdate() {
    reqStatus = "active";
    fetchWithAuth(variables.baseUrl + "/api/module/auth/user/update",
      {
        method: "POST",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: targetUser.userId,
          ...(userName !== targetUser.userName && { userName }),
          ...(userGroup !== targetUser.userGroup && { userGroup }),
          ...(phone !== targetUser.phone && { phone: phone.replace(/\D/g, "") }),
          ...(lastSemesterYear && `${lastSemesterYear}-${lastSemesterNum + 1}` !== targetUser.lastSemester && { lastSemester: `${lastSemesterYear}-${lastSemesterNum + 1}` })
        })
      }).then((res) => res.json()).then(() => {
      reqStatus = "finished";
      setTimeout(() => open = false, 500);
    }).catch((e) => {
      reqStatus = "error";
      console.error(e);
    });
  }
</script>

<ComposedModal bind:open on:submit={doUpdate} {...$$restProps}>
  <ModalHeader label="수정" title="사용자 수정" />
  <ModalBody hasForm>
    {#if targetUser}
      <FormGroup legendText="학번">
        <p>{targetUser.userId}</p>
      </FormGroup>
      <TextInput labelText="사용자 이름" placeholder="이름을 입력하세요..." bind:value={userName} />
      <Dropdown titleText="구분" items={groupDropdownItems} bind:selectedId={userGroup} />
      <TextInput labelText="전화번호" placeholder="전화번호를 입력하세요..." helperText="숫자가 아닌 값은 제거되어 등록됩니다." bind:value={phone} />
      <NumberInput label="마지막 재학 학기" placeholder="재학 년도를 입력하세요..." bind:value={lastSemesterYear} />
      <ContentSwitcher bind:selectedIndex={lastSemesterNum}>
        <Switch text="1학기" />
        <Switch text="2학기" />
      </ContentSwitcher>
    {:else}
      <InlineNotification
        hideCloseButton
        lowContrast
        kind="error"
        title="오류:"
        subtitle="선택된 사용자가 없습니다."
      />
    {/if}
  </ModalBody>
  <div style="display: flex; justify-content: end; padding-left: 0.825rem; padding-right: 0.825rem;">
    <div>
      {#if reqStatus === 'active'}
        <InlineLoading description="업데이트 중..." />
      {:else if reqStatus === 'finished'}
        <InlineLoading status="finished" description="새로고침 하면 정보가 반영됩니다." />
      {:else if reqStatus === 'error'}
        <InlineLoading status="error" description="오류 발생" />
      {/if}
    </div>
  </div>
  <ModalFooter
    primaryButtonDisabled={!userName &&
    (targetUser && (userName !== targetUser.userName ||
      userGroup !== targetUser.userGroup ||
      phone !== targetUser.phone ||
      (!targetUser.lastSemester && lastSemesterYear) ||
      (targetUser.lastSemester && targetUser.lastSemester !== `${lastSemesterYear}-${lastSemesterNum + 1}`)
    )) ||
    reqStatus !== 'pending'}
    primaryButtonText="수정" />
</ComposedModal>