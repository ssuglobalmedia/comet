<script lang="ts">
  import {
    Button,
    DataTable,
    DataTableSkeleton,
    Toolbar, ToolbarBatchActions, ToolbarContent,
    ToolbarSearch
  } from "carbon-components-svelte";
  import { browser } from "$app/env";
  import { variables } from "$lib/variables";
  import { fetchWithAuth, groupDisplayName } from "$lib/module/auth";
  import type { CometResponse, User } from "mirinae-comet";
  import { Delete16 } from "carbon-icons-svelte";

  type UserCell = {
    id: string;
  } & User;

  const headers = [
    { key: "userId", value: "학번" },
    { key: "userName", value: "사용자 이름" },
    { key: "userGroup", value: "구분" },
    { key: "phone", value: "전화번호" },
    { key: "lastSemester", value: "마지막 재학 학기" },
    { key: "edit", value: "수정" }
  ];
  let users: Array<UserCell> = undefined;

  let selectedUsers = [];

  const transformUser = (user: User): UserCell => ({
    id: user.userId,
    ...user,
    userGroup: groupDisplayName[user.userGroup] ?? user.userGroup
  });

  if (browser) {
    fetchWithAuth(`${variables.baseUrl as string}/api/module/auth/user/query`).then((res) => res.json()).then((res: CometResponse) => {
      if (!res.success) throw new Error(`Request error ${res.error}: ${res.error_description}`);
      users = (res.result as Array<User>).map(transformUser);
    }).catch((err) => {
      console.error(err);
    });
  }
</script>
{#if users}
  <DataTable
    batchSelection
    bind:selectedRowIds={selectedUsers}
    title="학부생 목록"
    description="학부생 목록을 열람하고 관리합니다."
    {headers}
    rows={users}
  >
    <Toolbar>
      <ToolbarBatchActions>
        <Button icon={Delete16}>삭제</Button>
      </ToolbarBatchActions>
      <ToolbarContent>
        <ToolbarSearch />
        <Button>XLSX로 내보내기</Button>
        <Button href="/module/auth/upload">파일으로부터 업로드</Button>
      </ToolbarContent>
    </Toolbar>
    <svelte:fragment slot="cell" let:row let:cell>
      {#if cell.key === "edit"}
        <Button>수정</Button>
      {:else}
        {cell.value ?? "정보 없음"}
      {/if}
    </svelte:fragment>
  </DataTable>
{:else}
  <DataTableSkeleton {headers} />
{/if}