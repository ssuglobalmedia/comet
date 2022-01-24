<script>
  import { ProgressStep, Tile, ProgressIndicator } from "carbon-components-svelte";
  let currentIdx = 0;
</script>

<h1>파일으로부터 업로드</h1>
<ProgressIndicator currentIndex={currentIdx}>
  <ProgressStep label="파일 업로드" />
  <ProgressStep label="데이터 확인" />
  <ProgressStep label="데이터 적용" />
</ProgressIndicator>
{#if currentIdx === 0}
  <Tile>
  파일 업로드
</Tile>
{:else if currentIdx === 1}
  <Tile>
    데이터 확인
  </Tile>
{:else}
  <Tile>
    데이터 적용
  </Tile>
{/if}