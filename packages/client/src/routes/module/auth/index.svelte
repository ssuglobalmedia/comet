<script lang="ts">
  import {
    Button, ButtonSet,
    DataTable,
    DataTableSkeleton,
    Pagination,
    PaginationSkeleton,
    Toolbar,
    ToolbarBatchActions,
    ToolbarContent,
    ToolbarSearch
  } from "carbon-components-svelte";
  import { browser } from "$app/env";
  import { variables } from "$lib/variables";
  import { userInfo } from "$lib/stores";
  import { fetchWithAuth, groupDisplayName } from "$lib/module/auth";
  import type { CometResponse, User } from "mirinae-comet";
  import { Checkmark16, Delete16, Edit16, Export16, Upload16 } from "carbon-icons-svelte";
  import UpdateModal from "../../../components/module/auth/UpdateModal.svelte";
  import BatchUpdateModal from "../../../components/module/auth/BatchUpdateModal.svelte";
  import ExportModal from "../../../components/module/auth/ExportModal.svelte";

  type UserCell = {
    id: string;
  } & User;

  const headers = [
    { key: "userId", value: "학번" },
    { key: "userName", value: "사용자 이름" },
    { key: "userGroup", value: "구분" },
    { key: "phone", value: "전화번호" },
    { key: "lastSemester", value: "마지막 재학 학기" },
    { key: "edit", value: "수정", empty: true }
  ];
  let users: Array<UserCell> = undefined;

  let selectedUsers: Array<string> = [];

  const transformUser = (user: User): UserCell => ({
    id: user.userId,
    ...user,
    userGroup: user.userGroup
  });

  if (browser) {
    updateUsers();
  }

  let pageSize = 25;
  let page = 1;

  let debouncer;

  function debounce(func: () => void) {
    clearTimeout(debouncer);
    debouncer = setTimeout(() => {
      func();
    }, 750);
  }

  let searchValue;
  let debouncedSearchValue;
  $: if (searchValue || debouncedSearchValue) {
    debounce(() => {
      debouncedSearchValue = searchValue;
    });
  }

  $: filteredUsers = users ? users.filter((v) => {
    if (!debouncedSearchValue) return true;
    return `${v.userId}`.includes(debouncedSearchValue) || v.userName.includes(debouncedSearchValue) || (groupDisplayName[v.userGroup ?? "unregistered"] ?? "").includes(debouncedSearchValue) || (v.lastSemester ?? "").includes(debouncedSearchValue) || `${v.phone ?? ""}`.includes(debouncedSearchValue);
  }) : [];

  let updateModalOpen = false;
  let batchUpdateModalOpen = false;
  let updateTargetUser: User = undefined;

  function updateUsers() {
    fetchWithAuth(`${variables.baseUrl as string}/api/module/auth/user/query`).then((res) => res.json()).then((res: CometResponse) => {
      if (!res.success) throw new Error(`Request error ${res.error}: ${res.error_description}`);
      users = (res.result as Array<User>).map(transformUser);
    }).catch((err) => {
      console.error(err);
    });
  }

  function openUpdateModal(row) {
    updateTargetUser = row;
    updateModalOpen = true;
  }

  function openBatchUpdateModal() {
    batchUpdateModalOpen = true;
  }

  function deleteSelected() {
    fetchWithAuth(variables.baseUrl + "/api/module/auth/user/batch/delete",
      {
        method: "POST",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(selectedUsers)
      }).then((res) => res.json()).then(() => {
      selectedUsers = [];
      updateUsers();
    });
  }

  let exportModalOpen = false;
</script>
{#if users}
  <DataTable
    zebra
    sortable
    batchSelection
    bind:selectedRowIds={selectedUsers}
    title="학부생 목록"
    description="학부생 목록을 열람하고 관리합니다."
    {headers}
    rows={filteredUsers}
    pageSize={pageSize}
    page={page}
  >
    <Toolbar>
      <ToolbarBatchActions formatTotalSelected={(totalSelected) => `${totalSelected}개 선택됨`}>
        <slot name="cancel">선택 해제</slot>
        <Button icon={Edit16} on:click={openBatchUpdateModal} disabled={$userInfo.userGroup !== "admin"}>일괄 수정</Button>
        <Button icon={Delete16} on:click={deleteSelected} disabled={$userInfo.userGroup !== "admin"}>삭제</Button>
      </ToolbarBatchActions>
      <ToolbarContent>
        <ToolbarSearch bind:value={searchValue} placeholder="검색하기..." />
        <Button on:click={() => { exportModalOpen = true; }} icon={Export16}>XLSX로 내보내기</Button>
        <Button href="/module/auth/check" icon={Checkmark16}>사용자 명단 확인</Button>
        <Button kind="secondary" href="/module/auth/upload" icon={Upload16}
                disabled={$userInfo.userGroup !== "admin"}>파일으로부터 업로드
        </Button>
      </ToolbarContent>
    </Toolbar>
    <svelte:fragment slot="cell" let:row let:cell>
      {#if cell.key === "edit"}
        <Button iconDescription="수정" kind="ghost" icon={Edit16} on:click={() => openUpdateModal(row)}
                disabled={$userInfo.userGroup !== "admin"} />
      {:else if cell.key === "userGroup"}
        {groupDisplayName[cell.value] ?? cell.value}
      {:else}
        {cell.value ?? "정보 없음"}
      {/if}
    </svelte:fragment>
  </DataTable>
  <Pagination
    pageSizes={[25, 50, 100, 200, 500]}
    bind:pageSize={pageSize}
    bind:page={page}
    totalItems={(filteredUsers).length}
  />
{:else}
  <DataTableSkeleton {headers} />
  <PaginationSkeleton />
{/if}
<ExportModal bind:open={exportModalOpen} bind:users={users} on:close={() => (exportModalOpen = false)} />
<UpdateModal bind:open={updateModalOpen} bind:targetUser={updateTargetUser}
             on:close={() => (updateModalOpen = false)} />
<BatchUpdateModal bind:open={batchUpdateModalOpen} userSupplier={users} selectedUserIds={selectedUsers}
                  on:close={() => (batchUpdateModalOpen = false)} />