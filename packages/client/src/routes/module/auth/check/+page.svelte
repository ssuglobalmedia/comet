<script lang="ts">
  import {
    Button,
    DataTable,
    DataTableSkeleton,
    FileUploader,
    ProgressIndicator,
    ProgressStep,
  } from 'carbon-components-svelte';
  import type { WorkBook } from 'xlsx';
  import { read, utils } from 'xlsx';
  import {
    NextFilled16,
    TaskComplete16,
    WarningAlt16,
    CheckmarkFilled16,
  } from 'carbon-icons-svelte';
  import StepTile from '../../../../lib/components/molcule/StepTile.svelte';
  import type { User } from '@types/mirinae-comet';
  import { isAccessible } from '$lib/module/auth';
  import { browser } from '$app/environment';
  import RuleDefiner from '../../../../lib/components/molcule/module/auth/RuleDefiner.svelte';
  import { getCurrentFullSemester } from '$lib/utils';
  import PaginationKor from '../../../../lib/components/atom/PaginationKor.svelte';
  import { apiUserQuery } from '$lib/api/module/auth';

  let files: Array<File> = [];
  let workbook: WorkBook = undefined;
  let data: Array<Record<string, any>> = undefined;
  $: previewHeader = data
    ? Object.keys(data[0])
        .filter((k) => k !== '__rowNum__')
        .map((k) => ({
          key: k,
          value: k,
        }))
    : [];
  $: previewData = data
    ? data.slice(0, 5).map((v) => ({
        id: v.__rowNum__,
        ...v,
      }))
    : [];
  let error = undefined;
  let currentIndex = 0;
  $: if (files.length && !workbook) {
    files[0].arrayBuffer().then((buf) => {
      try {
        workbook = read(buf, { type: 'buffer' });
        data = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      } catch (e) {
        error = e;
        console.error(e);
      }
    });
  }

  let validationRule;
  let validatedData;

  $: if (browser && currentIndex === 2 && validationRule && !validatedData) {
    (async () => {
      const res = await apiUserQuery();
      if (res.success) {
        const users: User[] = res.result;
        validatedData = data.reduce((arr, v) => {
          const userId = `${v[validationRule.userId]}`.trim();
          const userName = `${v[validationRule.userName]}`.trim();
          const exactUser = users.find((u) => u.userId === userId && u.userName === userName);
          const foundUser = users.filter((u) => u.userId === userId || u.userName === userName);
          const problems = [];
          if (!exactUser) {
            if (foundUser.length) {
              const sameIds = foundUser.filter((u) => u.userId === userId);
              const sameNames = foundUser.filter((u) => u.userName === userName);
              if (sameIds.length) {
                problems.push({ id: 'mismatch_name', fixes: sameIds.map((u) => u.userName) });
              }
              if (sameNames.length) {
                problems.push({ id: 'mismatch_id', fixes: sameNames.map((u) => u.userId) });
              }
            } else {
              problems.push({ id: 'no_user' });
            }
          } else {
            if (validationRule.checkPhone) {
              const phone = `${v[validationRule.phone]}`.trim().replace(/\D/g, '');
              if (exactUser.phone && exactUser.phone !== phone)
                problems.push({ id: 'mismatch_phone', fixes: [exactUser.phone] });
            }
            if (validationRule.checkCertificated) {
              if (!isAccessible(exactUser, 'certificated')) problems.push({ id: 'no_permission' });
            }
            if (validationRule.checkLastSemester) {
              if (exactUser.lastSemester !== getCurrentFullSemester())
                problems.push({ id: 'not_attended' });
            }
          }
          return [
            ...arr,
            {
              id: userId,
              userId,
              userName,
              ...(validationRule.checkPhone && {
                phone: `${v[validationRule.phone]}`.trim().replace(/\D/g, ''),
              }),
              problem: problems,
            },
          ];
        }, []);
        if (validationRule.checkPhone) {
          validationHeaders = [
            { key: 'problem', value: '??????' },
            { key: 'userId', value: '??????' },
            { key: 'userName', value: '????????? ??????' },
            { key: 'phone', value: '????????????' },
          ];
        }
      }
    })();
  }

  let validationHeaders = [
    { key: 'problem', value: '??????' },
    { key: 'userId', value: '??????' },
    { key: 'userName', value: '????????? ??????' },
  ];

  let validationTablePageSize = 25;
  let validationTablePage = 1;

  const problem_desc = {
    no_user: '????????? ????????? ?????? ??? ????????????.',
    mismatch_name: '????????? ??????????????? ????????? ???????????? ????????????.',
    mismatch_id: '????????? ??????????????? ????????? ???????????? ????????????.',
    mismatch_phone: '??????????????? ???????????? ????????????.',
    no_permission: '???????????? ????????????.',
    not_attended: '?????? ???????????? ????????????.',
  };
</script>

<ProgressIndicator spaceEqually class="my-4" bind:currentIndex>
  <ProgressStep complete={workbook} label="?????? ?????????" />
  <ProgressStep complete={validationRule !== undefined} disabled={!workbook} label="????????? ??????" />
  <ProgressStep complete={currentIndex > 2} disabled={!validationRule} label="?????? ??????" />
</ProgressIndicator>
{#if currentIndex === 0}
  <StepTile
    title="?????? ?????????"
    description="csv ?????? xls, xlsx ????????? ??????????????????. ????????? ?????? ???????????? ????????????, ?????? ????????? ?????? ?????? ????????? ????????? ???????????????.">
    <FileUploader
      buttonLabel="?????????"
      accept={['.csv', '.xls', '.xlsx']}
      bind:files
      status={workbook ? 'complete' : error ? 'edit' : 'loading'}
      on:change={() => {
        workbook = undefined;
        data = undefined;
        error = undefined;
      }} />
    <Button
      slot="navigation"
      on:click={() => {
        if (currentIndex < 1) currentIndex = 1;
      }}
      icon={NextFilled16}
      disabled={!workbook}
      >????????????
    </Button>
  </StepTile>
{:else if currentIndex === 1}
  <StepTile title="????????? ??????" description="???????????? ???????????? ???????????? ???????????????.">
    <DataTable
      title="????????? ??????"
      description="???????????? ???????????? ??????(??? 5???)??? ???????????????."
      headers={previewHeader}
      rows={previewData} />
    <RuleDefiner originalData={data} bind:rule={validationRule} />
    <Button
      slot="navigation"
      on:click={() => {
        if (currentIndex < 2) currentIndex = 2;
      }}
      icon={NextFilled16}
      disabled={!validationRule}
      >????????????
    </Button>
  </StepTile>
{:else}
  <StepTile title="?????? ??????" description="?????? ???????????? ???????????? ????????? ???????????????.">
    {#if validatedData}
      <DataTable
        batchExpansion
        sortable
        title="????????? ??????"
        description="???????????? ???????????????."
        headers={validationHeaders}
        rows={validatedData ?? []}
        pageSize={validationTablePageSize}
        page={validationTablePage}
        nonExpandableRowIds={(validatedData ?? [])
          .filter((v) => !v.problem.length)
          .map((v) => v.id)}>
        <svelte:fragment slot="cell" let:row let:cell>
          {#if cell.key === 'problem'}
            {#if cell.value.length}
              <WarningAlt16 />
            {:else}
              <CheckmarkFilled16 />
            {/if}
          {:else}
            {cell.value ?? '?????? ??????'}
          {/if}
        </svelte:fragment>
        <svelte:fragment slot="expanded-row" let:row>
          {#each row.problem as problem}
            <p><WarningAlt16 /> {problem_desc[problem.id]}</p>
            {#if problem.fixes && problem.fixes.length}
              <p>?????? ??????: {problem.fixes.join(', ')}</p>
            {/if}
          {/each}
        </svelte:fragment>
      </DataTable>
    {:else}
      <DataTableSkeleton headers={validationHeaders} />
    {/if}
    <PaginationKor
      bind:pageSize={validationTablePageSize}
      bind:page={validationTablePage}
      totalItems={(validatedData ?? []).length}
      pageSizes={[25, 50, 100, 200, 500]} />
    <Button slot="navigation" href="/module/auth" icon={TaskComplete16}>??????</Button>
  </StepTile>
{/if}
