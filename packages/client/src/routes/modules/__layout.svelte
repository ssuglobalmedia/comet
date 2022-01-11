<script>
    import {
        Button,
        Content,
        Header,
        HeaderNav,
        InlineNotification,
        SideNav,
        SideNavItems,
        SkipToContent
    } from "carbon-components-svelte";
    import {getAuthorization} from "$lib/utils.js";
    import {userInfo} from "$lib/stores.js";
    let isSideNavOpen;
    let isAuthorized = false;
    if(getAuthorization()) {
        isAuthorized = true;
    }
    if(isAuthorized && $userInfo) {
        document.cookie = `ssulocker_session=; max-age=-99999999;`;
    }
</script>

<Header company="미리내" platformName="COMET" bind:isSideNavOpen>
    <svelte:fragment slot="skip-to-content">
        <SkipToContent />
    </svelte:fragment>
    <HeaderNav>

    </HeaderNav>
</Header>

<SideNav bind:isOpen={isSideNavOpen}>
    <SideNavItems>

    </SideNavItems>
</SideNav>
<Content>
    {#if isAuthorized && $userInfo}
        <slot />
    {:else}
        {#if isAuthorized}
            <InlineNotification
                    hideCloseButton
                    title="오류:"
                    subtitle="인증 토큰을 이용하여 유저 정보를 가져오지 못했습니다. 다시 로그인하세요."
            />
        {/if}
        <h1>인증 필요</h1>
        <p>이 페이지를 볼 수 있는 권한이 없습니다. 로그인하여 페이지를 열람하세요.</p>
        <Button href="/" kind="danger" >메인 페이지로 돌아가기</Button>
    {/if}
</Content>