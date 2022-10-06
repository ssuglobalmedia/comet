<script lang='ts'>
    import {Button, Column, Content, Grid, InlineLoading} from "carbon-components-svelte";
    import EntryCard from "../../components/molcule/entry/EntryCard.svelte";
    import {variables} from "$lib/variables";
    import { browser } from '$app/environment';
    let result;
    let redirect;
    let id;
    if(browser) {
        result = new URLSearchParams(window.location.search).get('result');
        redirect = new URLSearchParams(window.location.search).get('redirect');
        id = fetch(variables.baseUrl + '/api/module/auth/callback?result=' + encodeURIComponent(result)).then((res) => res.json());
        id.then((data) => {
            document.cookie = `comet_session=${encodeURIComponent(data.access_token)}; path=/; domain=${window.location.hostname}; max-age=${data.expires_in}; samesite=lax`;
            window.location.href = redirect ? redirect : '/module/dashboard';
        });
    }
</script>

<svelte:head>
    <title>미리내 COMET</title>
</svelte:head>

<Content class="full background">
    <Grid class="background" style="height: 100%;">
        <Column sm={12} md={5} lg={4} class="full"
                style="display: flex; flex-direction: column; justify-content: center;">
            <EntryCard>
                {#await id}
                    <InlineLoading description="로그인하는 중..."/>
                {:then data}
                    {#if id}
                        <InlineLoading status="finished" description="로그인에 성공하였습니다."/>
                        <Button href="/module/dashboard" kind="ghost">자동으로 이동되지 않는 경우 클릭</Button>
                    {:else}
                        <InlineLoading status="inactive" description="로드 중..."/>
                    {/if}
                {:catch error}
                    <InlineLoading status="error" description="오류가 발생하였습니다: {JSON.stringify(error)}"/>
                    <Button href="/" kind="tertiary">돌아가기</Button>
                {/await}
            </EntryCard>
        </Column>
    </Grid>

</Content>

