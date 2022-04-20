<script lang="ts">
  import {
    Button,
    DataTable,
    DataTableSkeleton,
    FileUploader,
    ProgressIndicator,
    ProgressStep
  } from "carbon-components-svelte";
  import type {WorkBook} from "xlsx";
  import {read, utils} from "xlsx";
  import {NextFilled16, TaskComplete16, WarningAlt16, CheckmarkFilled16} from "carbon-icons-svelte";
  import StepTile from "../../../components/molcule/StepTile.svelte";
  import type {CometResponse, User} from "@types/mirinae-comet";
  import {fetchWithAuth, isAccessible} from "$lib/module/auth";
  import {browser} from "$app/env";
  import {variables} from "$lib/variables";
  import RuleDefiner from "../../../components/molcule/module/auth/RuleDefiner.svelte";
  import {getCurrentFullSemester} from "$lib/utils";
  import PaginationKor from "../../../components/atom/PaginationKor.svelte";

  let files: Array<File> = [];
  let workbook: WorkBook = undefined;
  let data: Array<Record<string, any>> = undefined;
  $: previewHeader = data ? Object.keys(data[0]).filter((k) => (k !== "__rowNum__")).map((k) => ({
    key: k, value: k
  })) : [];
  $: previewData = data ? data.slice(0, 5).map((v) => ({
    id: v.__rowNum__,
    ...v
  })) : [];
  let error = undefined;
  let currentIndex = 0;
  $: if (files.length && !workbook) {
    files[0].arrayBuffer().then((buf) => {
      try {
        workbook = read(buf, {type: "buffer"});
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
      const res = await (await fetchWithAuth(variables.baseUrl + "/api/module/auth/user/query")).json() as CometResponse;
      if (res.success) {
        const users: Array<User> = (res.result as Array<User>);
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
              if(sameIds.length) {
                problems.push({ id: "mismatch_name", fixes: sameIds.map((u) => u.userName)});
              }
              if(sameNames.length) {
                problems.push({ id: "mismatch_id", fixes: sameNames.map((u) => u.userId)});
              }
            } else {
              problems.push({ id: "no_user" });
            }
          } else {
            if(validationRule.checkPhone) {
              const phone = `${v[validationRule.phone]}`.trim().replace(/\D/g, "");
              if(exactUser.phone && exactUser.phone !== phone) problems.push({ id: "mismatch_phone", fixes: [exactUser.phone] });
            }
            if(validationRule.checkCertificated) {
              if(!isAccessible(exactUser, 'certificated')) problems.push({ id: "no_permission" });
            }
            if(validationRule.checkLastSemester) {
              if(exactUser.lastSemester !== getCurrentFullSemester()) problems.push({ id: "not_attended" });
            }
          }
          return [...arr, {
            id: userId,
            userId,
            userName,
            problem: problems
          }];
        }, []);
      }
    })();
  }

  const validationHeaders = [
    {key: "problem", value: "문제"},
    {key: "userId", value: "학번"},
    {key: "userName", value: "사용자 이름"},

  ];

  let validationTablePageSize = 25;
  let validationTablePage = 1;

  const problem_desc = {
    "no_user": "사용자 정보를 찾을 수 없습니다.",
    "mismatch_name": "학번은 일치하지만 이름은 일치하지 않습니다.",
    "mismatch_id": "이름은 일치하지만 학번은 일치하지 않습니다.",
    "mismatch_phone": "전화번호가 일치하지 않습니다.",
    "no_permission": "납부자가 아닙니다.",
    "not_attended": "현재 재학자가 아닙니다."
  }
</script>

<ProgressIndicator spaceEqually class="my-4" bind:currentIndex>
  <ProgressStep complete={workbook} label="파일 업로드"/>
  <ProgressStep complete={validationRule !== undefined} disabled={!workbook} label="데이터 확인"/>
  <ProgressStep complete={currentIndex > 2} disabled={!validationRule} label="문제 확인"/>
</ProgressIndicator>
{#if currentIndex === 0}
  <StepTile
      title="파일 업로드"
      description="csv 혹은 xls, xlsx 파일을 업로드하세요. 첫번째 열은 제목으로 간주되며, 여러 시트가 있을 경우 첫번째 시트만 인식합니다."
  >
    <FileUploader
        buttonLabel="업로드"
        accept={[".csv", ".xls", ".xlsx"]}
        bind:files
        status={workbook ? "complete" : error ? "edit" : "loading"}
        on:change={() => {
          workbook = undefined;
          data = undefined;
          error = undefined;
        }}
    />
    <Button slot="navigation" on:click={() => {if(currentIndex < 1) currentIndex = 1}} icon={NextFilled16}
            disabled={!workbook}>다음으로
    </Button>
  </StepTile>
{:else if currentIndex === 1}
  <StepTile
      title="데이터 확인"
      description="업로드한 데이터를 확인하고 변환하세요."
  >

    <DataTable
        title="데이터 확인"
        description="업로드한 데이터의 샘플(첫 5개)을 확인합니다."
        headers={previewHeader}
        rows={previewData}
    />
    <RuleDefiner originalData={data} bind:rule={validationRule}/>
    <Button slot="navigation" on:click={() => {if(currentIndex < 2) currentIndex = 2}} icon={NextFilled16}
            disabled={!validationRule}>다음으로
    </Button>
  </StepTile>
{:else}
  <StepTile
      title="문제 확인"
      description='전체 데이터를 검증하고 문제를 확인합니다.'
  >
    {#if validatedData}
      <DataTable
          batchExpansion
          sortable
          title="데이터 확인"
          description="데이터를 확인합니다."
          headers={validationHeaders}
          rows={validatedData ?? []}
          pageSize={validationTablePageSize}
          page={validationTablePage}
          nonExpandableRowIds={(validatedData ?? []).filter((v) => !v.problem.length).map((v) => v.id)}
      >
        <svelte:fragment slot="cell" let:row let:cell>
          {#if cell.key === "problem"}
            {#if cell.value.length}
              <WarningAlt16 />
            {:else}
              <CheckmarkFilled16 />
            {/if}
          {:else}
            {cell.value ?? "정보 없음"}
          {/if}
        </svelte:fragment>
        <svelte:fragment slot="expanded-row" let:row>
          {#each row.problem as problem}
            <p><WarningAlt16 /> {problem_desc[problem.id]}</p>
            {#if problem.fixes && problem.fixes.length}
              <p>추천 수정: {problem.fixes.join(", ")}</p>
            {/if}
          {/each}
        </svelte:fragment>
      </DataTable>
    {:else}
      <DataTableSkeleton headers={validationHeaders}/>
    {/if}
    <PaginationKor
        bind:pageSize={validationTablePageSize}
        bind:page={validationTablePage}
        totalItems={(validatedData ?? []).length}
        pageSizes={[25, 50, 100, 200, 500]}
    />
    <Button slot="navigation" href="/module/auth" icon={TaskComplete16}>완료</Button>
  </StepTile>
{/if}