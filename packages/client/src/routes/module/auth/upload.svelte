<script lang="ts">
  import {
    ProgressStep,
    Tile,
    ProgressIndicator,
    FileUploader,
    Grid,
    Column,
    Button,
    InlineLoading
  } from "carbon-components-svelte";
  import { read, set_cptable } from "xlsx";
  import * as cptable from "xlsx/dist/cpexcel.full.mjs";
  import { NextFilled16, SendToBack16 } from "carbon-icons-svelte";

  set_cptable(cptable);
  let files: Array<File> = [];
  let workbook = undefined;
  let error = undefined;
  let conversion = undefined;
  let response = undefined;
  let currentIndex = 0;
  $: if (files.length && !workbook) {
    console.log(files[0]);
    files[0].arrayBuffer().then((buf) => {
      try {
        workbook = read(buf, { type: "buffer" });
      } catch (e) {
        error = e;
        console.error(e);
      }
      console.log(workbook);
    });
  }
</script>

<ProgressIndicator preventChangeOnClick={currentIndex > 2} spaceEqually class="my-4" bind:currentIndex>
  <ProgressStep complete={workbook} label="파일 업로드" />
  <ProgressStep complete={conversion} disabled={!workbook} label="데이터 확인/변환" />
  <ProgressStep complete={currentIndex > 2} disabled={!conversion} label="데이터 적용" />
  <ProgressStep complete={currentIndex > 3 && response && response.success && !response.result.conflict.length} disabled={currentIndex < 3} label="업로드" />
</ProgressIndicator>
{#if currentIndex === 0}
  <Tile>
    <h1>파일 업로드</h1>
    <p>csv 혹은 xls, xlsx 파일을 업로드하세요.</p>
    <div class="my-4">
      <FileUploader
        buttonLabel="업로드"
        accept={[".csv", ".xls", ".xlsx"]}
        bind:files
        status={workbook ? "complete" : error ? "edit" : "loading"}
        on:change={() => {
          workbook = undefined;
          error = undefined;
        }}
      />
      <Grid noGutter condensed>
        <Column style="display: flex; justify-content: end;">
          <Button on:click={() => {if(currentIndex < 1) currentIndex = 1}} icon={NextFilled16} disabled={!workbook}>다음으로</Button>
        </Column>
      </Grid>
    </div>
  </Tile>
{:else if currentIndex === 1}
  <Tile>
    <h1>데이터 확인/변환</h1>
    <p>업로드한 데이터를 확인하고 변환하세요.</p>
    <Grid noGutter condensed>
      <Column style="display: flex; justify-content: end;">
        <Button on:click={() => {if(currentIndex < 2) currentIndex = 2}} icon={NextFilled16} disabled={!workbook}>다음으로</Button>
      </Column>
    </Grid>
  </Tile>
{:else if currentIndex === 2}
  <Tile>
    <h1>데이터 적용</h1>
    <p>업로드할 데이터를 확인하고 "다음으로"를 눌러 적용하세요.</p>
    <Grid noGutter condensed>
      <Column style="display: flex; justify-content: end;">
        <Button on:click={() => {if(currentIndex < 3) currentIndex = 3}} icon={NextFilled16} disabled={!workbook}>다음으로</Button>
      </Column>
    </Grid>
  </Tile>
{:else}
  <Tile>
    <h1>업로드</h1>
    <InlineLoading description="데이터베이스에 등록 중입니다..." />
    <Grid noGutter condensed>
      <Column style="display: flex; justify-content: end;">
        <Button href='/module/auth' icon={SendToBack16}>돌아가기</Button>
      </Column>
    </Grid>
  </Tile>
{/if}