<script lang="ts">
  import { Button, Column, Content, Grid, InlineLoading } from 'carbon-components-svelte';
  import EntryCard from '../../lib/components/molcule/entry/EntryCard.svelte';
  import { browser } from '$app/environment';
  import { apiCallback } from '$lib/api/module/auth';
  import { InternalError } from '$lib/api/error';
  let result;
  let redirect;
  let id;
  if (browser) {
    result = new URLSearchParams(window.location.search).get('result');
    redirect = new URLSearchParams(window.location.search).get('redirect');
    id = apiCallback(result).then((res) => {
      if(res.success) {
        const data = res.result;
        document.cookie = `comet_session=${encodeURIComponent(data.accessToken)}; path=/; domain=${
          window.location.hostname
        }; max-age=${data.expiresIn}; samesite=lax`;
        window.location.href = redirect ? redirect : '/module/dashboard';
        return data;
      } else {
        if(res.success === false) throw res.error;
        throw new InternalError('', res);
      }
    });
  }
</script>

<svelte:head>
  <title>미리내 COMET</title>
</svelte:head>

<Content class="full background">
  <Grid class="background" style="height: 100%;">
    <Column
      sm={12}
      md={5}
      lg={4}
      class="full"
      style="display: flex; flex-direction: column; justify-content: center;">
      <EntryCard>
        {#await id}
          <InlineLoading description="로그인하는 중..." />
        {:then data}
          {#if id}
            <InlineLoading status="finished" description="로그인에 성공하였습니다." />
            <Button href="/module/dashboard" kind="ghost">자동으로 이동되지 않는 경우 클릭</Button>
          {:else}
            <InlineLoading status="inactive" description="로드 중..." />
          {/if}
        {:catch error}
          <InlineLoading
            status="error"
            description="오류가 발생하였습니다: {JSON.stringify(error)}" />
          <Button href="/" kind="tertiary">돌아가기</Button>
        {/await}
      </EntryCard>
    </Column>
  </Grid>
</Content>
