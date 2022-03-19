<script lang="ts">
  import type { User } from "@types/mirinae-comet";
  import {
      Checkbox,
      ComposedModal, FormGroup, ModalBody, ModalFooter, ModalHeader
  } from "carbon-components-svelte";
  import { groupDisplayName } from "$lib/module/auth";
  import { utils, writeXLSX } from "xlsx";

  export let open = false;

  export let users: Array<User> = undefined;

  let includeUserId = true;
  let includeUserName = true;
  let includeUserGroup = true;
  let includePhone = true;
  let includeLastSemester = true;

  $: readableUsers = (users ?? []).map((u: User) => ({
    ...(includeUserId && { 학번: u.userId }),
    ...(includeUserName && { 성명: u.userName }),
    ...(includeUserGroup && { "사용자 구분": groupDisplayName[u.userGroup] ?? '알 수 없음' }),
    ...(includePhone && { 전화번호: (u.phone ?? '정보 없음') }),
    ...(includeLastSemester && { "마지막 재학 학기": (u.lastSemester ?? '정보 없음') }),
  }));

  function generate() {
    const workBook = utils.book_new();
    const workSheet = utils.json_to_sheet(readableUsers);
    utils.book_append_sheet(workBook, workSheet, "학부생 목록");
    const xlsx = writeXLSX(workBook, {
      type: "array",
      bookType: "xlsx"
    });
    const blob = URL.createObjectURL(new Blob([xlsx], { type: "application/octet-stream" }));
    const link = document.createElement("a");
    link.href = blob;
    link.download = `학부생_목록_${new Date().toISOString()}.xlsx`;
    link.click();
  }
</script>

<ComposedModal bind:open on:submit={generate} {...$$restProps}>
  <ModalHeader label="내보내기" title="사용자 내보내기" />
  <ModalBody hasForm>
      <FormGroup legendText="포함할 열 선택">
        <Checkbox labelText="학번" bind:checked={includeUserId} />
        <Checkbox labelText="사용자 이름" bind:checked={includeUserName} />
        <Checkbox labelText="구분" bind:checked={includeUserGroup} />
        <Checkbox labelText="전화번호" bind:checked={includePhone} />
        <Checkbox labelText="마지막 재학 학기" bind:checked={includeLastSemester} />
      </FormGroup>
  </ModalBody>
  <ModalFooter
    primaryButtonText="다운로드" />
</ComposedModal>