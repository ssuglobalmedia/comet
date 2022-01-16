<script lang='ts'>
    import {Button, Column, Content, Grid, ImageLoader, Tile} from "carbon-components-svelte";
    import Soongsil from "../icons/Soongsil.svelte";
    import {onMount} from "svelte";
    import {getAuthorization} from "$lib/module/auth";
    import EntryCard from "../components/entry/EntryCard.svelte";

    let callbackUrl;
    let loginCookie;
    onMount(() => {
        loginCookie = getAuthorization();
        if (loginCookie) {
            window.location.href = '/modules';
        }
        callbackUrl = window.location.protocol + '//' + window.location.host + '/callback/';
    });
</script>

<svelte:head>
    <title>미리내 COMET</title>
</svelte:head>

<Content class="g100 full">
    <Grid class="g100" style="height: 100%;">
        <Column sm={12} md={5} lg={4} class="full"
                style="display: flex; flex-direction: column; justify-content: center;">
            <EntryCard>
                <Button icon={Soongsil} style="width: 100%" skeleton={callbackUrl === undefined}
                        href='https://class.ssu.ac.kr/xn-sso/gw.php?login_type=standalone&callback_url={encodeURIComponent(callbackUrl)}'>
                    숭실대학교로 로그인
                </Button>
            </EntryCard>
        </Column>
    </Grid>

</Content>

<style lang="scss">
  :global(.g100) {
    background-color: $carbon--gray-100;
  }

  :global(.full) {
    min-height: 100%;
    inline-size: 100%;
    block-size: 100%;
  }
</style>

