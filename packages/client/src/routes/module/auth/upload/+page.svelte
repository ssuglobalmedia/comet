<script lang="ts">
  import {
    ProgressStep,
    Tile,
    ProgressIndicator,
    FileUploader,
    Grid,
    Column,
    Button,
    InlineLoading,
    DataTable,
    DataTableSkeleton,
    Row,
  } from 'carbon-components-svelte';
  import type { WorkBook } from 'xlsx';
  import { read, utils } from 'xlsx';
  import { NextFilled16, SendToBack16, Upload16 } from 'carbon-icons-svelte';
  import StepTile from '../../../../components/molcule/StepTile.svelte';
  import DataTransformer from '../../../../components/molcule/module/auth/DataTransformer.svelte';
  import type { CometResponse, User } from '@types/mirinae-comet';
  import { fetchWithAuth, groupDisplayName } from '$lib/module/auth';
  import { browser } from '$app/environment';
  import { variables } from '$lib/variables';
  import { getCurrentFullSemester } from '$lib/utils';
  import PaginationKor from '../../../../components/atom/PaginationKor.svelte';

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
  let conversion = undefined;
  let convertedData: Array<User> = undefined;
  let response = undefined;
  let responseSuccess = false;
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

  function convertGroup(groupConversion, value) {
    const defaults = Object.entries(groupConversion).filter(([key, value]) => value.defaults);
    const defaultGroup = defaults.length ? defaults[0][0] : 'unregistered';
    const groups = Object.fromEntries(
      Object.entries(groupConversion)
        .filter(([key, value]) => value.keyword !== undefined)
        .map(([key, value]) => [value.keyword, key]),
    );
    if (Object.prototype.hasOwnProperty.call(groups, value)) return groups[value];
    return defaultGroup;
  }

  $: if (currentIndex === 2 && conversion && !convertedData) {
    (async () => {
      const converted: Array<User> = data.map((v) => ({
        id: v[conversion.userId],
        userId: v[conversion.userId],
        userName: v[conversion.userName],
        userGroup: convertGroup(conversion.userGroupConv, v[conversion.userGroup]),
        ...(conversion.phone && { phone: v[conversion.phone].replace(/\D/g, '') }),
        ...(conversion.lastSemester && {
          lastSemester:
            conversion.lastSemester === ':latest'
              ? getCurrentFullSemester()
              : v[conversion.lastSemester],
        }),
      }));
      if (conversion.noOverwrite) {
        const res = (await (
          await fetchWithAuth(variables.baseUrl + '/api/module/auth/user/query')
        ).json()) as CometResponse;
        if (res.success) {
          const originalUsers = res.result as Array<User>;
          convertedData = converted.filter((newUser) =>
            originalUsers.every((org) => `${org.userId}` !== `${newUser.userId}`),
          );
        } else {
          console.error(res.error_description);
          convertedData = [];
        }
      } else {
        convertedData = converted;
      }
    })();
  }

  $: if (browser && currentIndex === 3 && convertedData) {
    fetchWithAuth(variables.baseUrl + '/api/module/auth/user/batch/put', {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(convertedData),
    })
      .then((res) => res.json())
      .then((resJson) => {
        response = resJson;
        responseSuccess = true;
      })
      .catch((e) => {
        response = e;
        console.error(e);
      });
  }

  const convertedHeaders = [
    { key: 'userId', value: '학번' },
    { key: 'userName', value: '사용자 이름' },
    { key: 'userGroup', value: '구분' },
    { key: 'phone', value: '전화번호' },
    { key: 'lastSemester', value: '마지막 재학 학기' },
  ];

  let convertTablePageSize = 25;
  let convertTablePage = 1;
  $: loadingDesc =
    response && responseSuccess
      ? '데이터 등록이 완료되었습니다.'
      : response
      ? '데이터 등록에 실패했습니다.'
      : '데이터베이스에 등록 중입니다...';
</script>

<ProgressIndicator
  preventChangeOnClick={currentIndex > 2}
  spaceEqually
  class="my-4"
  bind:currentIndex>
  <ProgressStep complete={workbook} label="파일 업로드" />
  <ProgressStep complete={conversion !== undefined} disabled={!workbook} label="데이터 확인/변환" />
  <ProgressStep complete={currentIndex > 2} disabled={!conversion} label="데이터 적용" />
  <ProgressStep
    complete={currentIndex > 3 && response && response.success}
    disabled={currentIndex < 3}
    label="업로드" />
</ProgressIndicator>
{#if currentIndex === 0}
  <StepTile
    title="파일 업로드"
    description="csv 혹은 xls, xlsx 파일을 업로드하세요. 첫번째 열은 제목으로 간주되며, 여러 시트가 있을 경우 첫번째 시트만 인식합니다.">
    <p style="color: var(--cds-danger-02)">
      이미 존재하는 사용자의 정보를 업로드할 경우 기존 정보가 전부 덮어씌워지므로 주의하세요!
    </p>
    <FileUploader
      buttonLabel="업로드"
      accept={['.csv', '.xls', '.xlsx']}
      bind:files
      status={workbook ? 'complete' : error ? 'edit' : 'loading'}
      on:change={() => {
        workbook = undefined;
        data = undefined;
        error = undefined;
        conversion = undefined;
        convertedData = undefined;
      }} />
    <Button
      slot="navigation"
      on:click={() => {
        if (currentIndex < 1) currentIndex = 1;
      }}
      icon={NextFilled16}
      disabled={!workbook}
      >다음으로
    </Button>
  </StepTile>
{:else if currentIndex === 1}
  <StepTile title="데이터 확인/변환" description="업로드한 데이터를 확인하고 변환하세요.">
    <DataTable
      title="데이터 확인"
      description="업로드한 데이터의 샘플(첫 5개)을 확인합니다."
      headers={previewHeader}
      rows={previewData} />
    <DataTransformer originalData={data} bind:conversion />
    <Button
      slot="navigation"
      on:click={() => {
        if (currentIndex < 2) currentIndex = 2;
      }}
      icon={NextFilled16}
      disabled={!conversion}
      >다음으로
    </Button>
  </StepTile>
{:else if currentIndex === 2}
  <StepTile
    title="데이터 적용"
    description="등록할 데이터를 확인하고 "다음으로"를 눌러 적용하세요.">
    {#if convertedData}
      <DataTable
        sortable
        title="데이터 확인"
        description="등록할 데이터를 확인합니다."
        headers={convertedHeaders}
        rows={convertedData ?? []}
        pageSize={convertTablePageSize}
        page={convertTablePage}>
        <svelte:fragment slot="cell" let:row let:cell>
          {#if cell.key === 'userGroup'}
            {groupDisplayName[cell.value]}
          {:else}
            {cell.value ?? '정보 없음'}
          {/if}
        </svelte:fragment>
      </DataTable>
    {:else}
      <DataTableSkeleton headers={convertedHeaders} />
    {/if}
    <PaginationKor
      bind:pageSize={convertTablePageSize}
      bind:page={convertTablePage}
      totalItems={(convertedData ?? []).length}
      pageSizeInputDisabled />
    <Button
      slot="navigation"
      on:click={() => {
        if (currentIndex < 3) currentIndex = 3;
      }}
      icon={Upload16}>등록하기</Button>
  </StepTile>
{:else}
  <Tile>
    <h1>등록</h1>
    <InlineLoading
      description={loadingDesc}
      status={response && responseSuccess ? 'finished' : response ? 'error' : 'active'} />
    <Grid noGutter condensed>
      <Row>
        <Column style="display: flex; justify-content: end;">
          <Button href="/module/auth" icon={SendToBack16}>돌아가기</Button>
        </Column>
      </Row>
    </Grid>
  </Tile>
{/if}
