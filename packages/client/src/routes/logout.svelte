<script lang='ts'>
    import {Button, Column, Content, Grid, InlineLoading} from "carbon-components-svelte";
    import Soongsil from "../icons/Soongsil.svelte";
    import {onMount} from "svelte";
    import {getAuthorization} from "$lib/module/auth";
    import EntryCard from "../components/entry/EntryCard.svelte";

    let loginCookie;
    let isAuthorized = false;
    onMount(() => {
        if(getAuthorization()) {
            isAuthorized = true;
        }
        document.cookie = `comet_session=; path=/; max-age=-99999999;`;
    });
</script>

<svelte:head>
    <title>미리내 COMET</title>
</svelte:head>

<Content class="full background">
    <Grid class="background" style="height: 100%;">
        <Column sm={12} md={5} lg={4} class="full"
                style="display: flex; flex-direction: column; justify-content: center;">
            <EntryCard>
                {#if isAuthorized}
                    <InlineLoading status="finished" description="로그아웃에 성공하였습니다."/>
                {:else}
                    <InlineLoading status="error" description="이미 로그아웃된 상태입니다." />
                {/if}
                <Button href="/" kind="primary">클릭하여 메인으로 이동</Button>
            </EntryCard>
        </Column>
    </Grid>

</Content>

