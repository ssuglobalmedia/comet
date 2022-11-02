<script lang="ts">
  import {
    Accordion,
    AccordionItem,
    Button,
    Checkbox,
    Column,
    DataTable,
    DataTableSkeleton,
    FormGroup,
    Grid,
    MultiSelect,
    PaginationSkeleton,
    Row,
    Toolbar,
    ToolbarBatchActions,
    ToolbarContent,
    ToolbarMenu,
    ToolbarMenuItem,
    ToolbarSearch,
  } from 'carbon-components-svelte';
  import { browser } from '$app/environment';
  import { userInfo } from '$lib/stores';
  import { groupDisplayName } from '$lib/module/auth';
  import type { User } from 'mirinae-comet';
  import { Checkmark16, Delete16, Edit16 } from 'carbon-icons-svelte';
  import UpdateModal from '../../../lib/components/molcule/module/auth/UpdateModal.svelte';
  import BatchUpdateModal from '../../../lib/components/molcule/module/auth/BatchUpdateModal.svelte';
  import ExportModal from '../../../lib/components/molcule/module/auth/ExportModal.svelte';
  import PaginationKor from '../../../lib/components/atom/PaginationKor.svelte';
  import { apiUserBatchDelete, apiUserQuery } from '$lib/api/module/auth';

  type UserCell = {
    id: string;
  } & User;

  const headers = [
    { key: 'userId', value: '학번' },
    { key: 'userName', value: '사용자 이름' },
    { key: 'userGroup', value: '구분' },
    { key: 'phone', value: '전화번호' },
    { key: 'lastSemester', value: '마지막 재학 학기' },
    { key: 'edit', value: '수정', empty: true },
  ];
  let users: Array<UserCell> = undefined;

  let selectedUsers: Array<string> = [];

  const transformUser = (user: User): UserCell => ({
    id: user.userId,
    ...user,
    userGroup: user.userGroup,
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

  function filterUser(users) {
    return users.filter((v) => {
      if (
        (v.lastSemester === undefined && !selectedSemesters.includes('none')) ||
        (v.lastSemester !== undefined && !selectedSemesters.includes(v.lastSemester))
      ) {
        return false;
      }
      if (!selectedGroups.includes(v.userGroup)) {
        return false;
      }
      if (!debouncedSearchValue) return true;
      return (
        `${v.userId}`.includes(debouncedSearchValue) ||
        v.userName.includes(debouncedSearchValue) ||
        (groupDisplayName[v.userGroup ?? 'unregistered'] ?? '').includes(debouncedSearchValue) ||
        (v.lastSemester ?? '').includes(debouncedSearchValue) ||
        `${v.phone ?? ''}`.includes(debouncedSearchValue)
      );
    });
  }

  $: filteredUsers =
    (users && selectedGroups && selectedSemesters) || (users && debouncedSearchValue)
      ? filterUser(users)
      : [];

  $: semesters = users
    ? Array.from(
        users.reduce<Set<string>>((set, value) => set.add(value.lastSemester), new Set<string>()),
      ).map((v) =>
        v
          ? {
              id: v,
              text: v,
            }
          : { id: 'none', text: '정보 없음' },
      )
    : [];
  let selectedSemesters = [];
  let selectedGroups = Object.keys(groupDisplayName);

  function updateSelectedSemesters() {
    selectedSemesters = semesters.map((v) => v.id);
  }

  $: if (semesters) updateSelectedSemesters();

  let updateModalOpen = false;
  let batchUpdateModalOpen = false;
  let updateTargetUser: User = undefined;

  function updateUsers() {
    users = undefined;
    apiUserQuery()
      .then((res) => {
        if (res.success === false)
          throw new Error(`Request error ${res.error.name}: ${res.error.message}`);
        if (res.success) users = (res.result as Array<User>).map(transformUser);
      })
      .catch((err) => {
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
    apiUserBatchDelete(selectedUsers)
      .then(() => {
        selectedUsers = [];
        updateUsers();
      });
  }

  let exportModalOpen = false;
</script>

<Grid>
  <Row>
    <Column>
      <h1>학부생 목록</h1>
    </Column>
    <Column style="display: flex; justify-content: end;">
      <Button href="/module/auth/check" icon={Checkmark16}>명단 확인</Button>
    </Column>
  </Row>
  <Row style="margin-top: 1rem;">
    <Column>
      <Accordion>
        <AccordionItem title="필터">
          <FormGroup legendText="구분" style="display: flex; gap: 0.1rem;">
            {#each Object.entries(groupDisplayName) as [name, displayName]}
              <Checkbox bind:group={selectedGroups} labelText={displayName} value={name} />
            {/each}
          </FormGroup>
          <MultiSelect
            titleText="마지막 재학 학기"
            label="포함할 재학 학기를 선택하세요..."
            bind:selectedIds={selectedSemesters}
            items={semesters} />
        </AccordionItem>
      </Accordion>
      <div style="width: 100%; min-width: 400px;">
        {#if users}
          <DataTable
            sortable
            batchSelection
            bind:selectedRowIds={selectedUsers}
            {headers}
            rows={filteredUsers}
            {pageSize}
            {page}>
            <Toolbar>
              <ToolbarBatchActions
                formatTotalSelected={(totalSelected) => `${totalSelected}개 선택됨`}>
                <svelte:fragment slot="cancel">선택 해제</svelte:fragment>
                <Button
                  icon={Edit16}
                  on:click={openBatchUpdateModal}
                  disabled={$userInfo.userGroup !== 'admin'}
                  >일괄 수정
                </Button>
                <Button
                  icon={Delete16}
                  on:click={deleteSelected}
                  disabled={$userInfo.userGroup !== 'admin'}>삭제</Button>
              </ToolbarBatchActions>
              <ToolbarContent>
                <ToolbarSearch persistent bind:value={searchValue} placeholder="검색하기..." />
                <ToolbarMenu>
                  <ToolbarMenuItem
                    on:click={() => {
                      exportModalOpen = true;
                    }}
                    primaryFocus>XLSX로 내보내기</ToolbarMenuItem>
                  <ToolbarMenuItem
                    href="/module/auth/upload"
                    disabled={$userInfo.userGroup !== 'admin'}>
                    파일 업로드
                  </ToolbarMenuItem>
                </ToolbarMenu>
              </ToolbarContent>
            </Toolbar>
            <svelte:fragment slot="cell" let:row let:cell>
              {#if cell.key === 'edit'}
                <Button
                  iconDescription="수정"
                  kind="ghost"
                  icon={Edit16}
                  on:click={() => openUpdateModal(row)}
                  disabled={$userInfo.userGroup !== 'admin'} />
              {:else if cell.key === 'userGroup'}
                {groupDisplayName[cell.value] ?? cell.value}
              {:else}
                {cell.value ?? '정보 없음'}
              {/if}
            </svelte:fragment>
          </DataTable>
          <PaginationKor
            pageSizes={[25, 50, 100, 200, 500]}
            bind:pageSize
            bind:page
            totalItems={filteredUsers.length} />
        {:else}
          <DataTableSkeleton {headers} />
          <PaginationSkeleton />
        {/if}
      </div>
    </Column>
  </Row>
</Grid>

<ExportModal bind:open={exportModalOpen} bind:users on:close={() => (exportModalOpen = false)} />
<UpdateModal
  bind:open={updateModalOpen}
  bind:targetUser={updateTargetUser}
  on:close={() => (updateModalOpen = false)}
  on:update={updateUsers} />
<BatchUpdateModal
  bind:open={batchUpdateModalOpen}
  userSupplier={users}
  selectedUserIds={selectedUsers}
  on:close={() => (batchUpdateModalOpen = false)}
  on:update={updateUsers} />
