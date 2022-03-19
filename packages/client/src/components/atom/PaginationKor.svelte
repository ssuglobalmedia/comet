<script>
  import { Pagination } from "carbon-components-svelte";

  export let page = 1;
  export let pageSize = 10;
</script>
<Pagination bind:page bind:pageSize
            forwardText="다음 페이지"
            backwardText="이전 페이지"
            itemsPerPageText="페이지 별 항목 수:"
            itemText={(min ,max) => `항목 ${min}-${max}`}
            itemRangeText={(min, max, total) => `항목 ${total} 중 ${min}-${max}`}
            pageText={(page) => `${page} 페이지`}
            pageRangeText={(current, total) => `/ ${total} 페이지`}
            {...$$restProps}
>
  <slot />
</Pagination>