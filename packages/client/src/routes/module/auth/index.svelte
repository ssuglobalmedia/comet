<script lang="ts">
  import { Button, Column, DataTable, Grid } from "carbon-components-svelte";
  import { browser } from "$app/env";
  import { variables } from "$lib/variables";
  import { fetchWithAuth } from "$lib/module/auth";
  import type {CometResponse, User} from "mirinae-comet";

  let users: Array<User> = [];

  if(browser) {
    fetchWithAuth(`${variables.baseUrl as string}/api/module/auth/user/query`).then((res) => res.json()).then((res: CometResponse) => {
      if(res.success) {
        users = res.result as Array<User>;
      }
      throw new Error(`Request error ${res.error}: ${res.error_description}`)
    }).catch((err) => {
      console.error(err);
    });
  }
</script>

<Grid noGutter condensed>
  <Column>
    <h1>사용자 목록</h1>
  </Column>
  <Column>
    <Button>XLSX로 내보내기</Button>
    <Button href="/module/auth/upload">파일으로부터 업로드</Button>
  </Column>
</Grid>

<DataTable
  headers={[
  { key: "userName", value: "사용자 이름" },
  { key: "userId", value: "학번" },
  { key: "group", value: "구분" },
  { key: "phone", value: "전화번호" },
  { key: "lastSemester", value: "마지막 재학 학기" },
  { key: "edit", value: "수정" },
  { key: "select", value: "선택" }
  ]}
  rows={[
    {
      id: "20211561",
      userName: "구효민",
      userId: "20211561",
      group: "관리자",
      phone: "01012345678",
      lastSemester: "2022-1",
      edit: ""
    }
  ]}
>
  <svelte:fragment slot="cell" let:row let:cell>
    {#if cell.key === "edit"}
      <Button>수정</Button>
    {:else}
      {cell.value}
    {/if}
  </svelte:fragment>
</DataTable>