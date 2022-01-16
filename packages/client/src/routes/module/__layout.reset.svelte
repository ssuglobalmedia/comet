<script>
    import '../../styles/app.scss';
    import {
        Breadcrumb, BreadcrumbItem,
        Button,
        Content,
        Header, HeaderAction,
        HeaderNav, HeaderPanelDivider, HeaderPanelLink, HeaderPanelLinks, HeaderUtilities, InlineLoading,
        InlineNotification,
        SkipToContent
    } from "carbon-components-svelte";
    import { expoIn } from "svelte/easing";
    import {getAuthorization} from "$lib/module/auth";
    import {userInfo} from "$lib/stores";
    import { onMount } from "svelte";
    import { UserAvatarFilledAlt20 } from "carbon-icons-svelte";
    let isSideNavOpen;
    let isAuthorized = false;
    let isModuleSwitcherOpen = false;
    let isUserInfoOpen = false;
    let selected = "0";
    let transitions = {
        "0": {
            text: "Default (duration: 200ms)",
            value: { duration: 200 },
        },
        "1": {
            text: "Custom (duration: 600ms, delay: 50ms, easing: expoIn)",
            value: { duration: 600, delay: 50, easing: expoIn },
        },
        "2": {
            text: "Disabled",
            value: false,
        },
    };
    onMount(() => {
        if(getAuthorization()) {
            isAuthorized = true;
        }
        if(!isAuthorized || $userInfo === null) {
            document.cookie = `comet_session=; max-age=-99999999;`;
        }
    });
</script>

<Header company="미리내" platformName="COMET" bind:isSideNavOpen>
    <svelte:fragment slot="skip-to-content">
        <SkipToContent />
    </svelte:fragment>
    <HeaderNav>
        {#if $userInfo === undefined}
            <InlineLoading description="사용자 정보를 가져오는 중..." />
        {/if}
    </HeaderNav>
    {#if isAuthorized && $userInfo}
        <HeaderUtilities>
            <HeaderAction
              bind:isOpen={isUserInfoOpen}
              icon={UserAvatarFilledAlt20}
              closeIcon={UserAvatarFilledAlt20}
              text="{$userInfo.name}"
            >
                <HeaderPanelLinks>
                    <HeaderPanelDivider>Switcher subject 1</HeaderPanelDivider>
                    <HeaderPanelLink>Switcher item 1</HeaderPanelLink>
                    <HeaderPanelLink>Switcher item 2</HeaderPanelLink>
                    <HeaderPanelLink>Switcher item 3</HeaderPanelLink>
                    <HeaderPanelLink>Switcher item 4</HeaderPanelLink>
                    <HeaderPanelDivider>Switcher subject 2</HeaderPanelDivider>
                    <HeaderPanelLink>Switcher item 1</HeaderPanelLink>
                    <HeaderPanelLink>Switcher item 2</HeaderPanelLink>
                    <HeaderPanelDivider>Switcher subject 3</HeaderPanelDivider>
                    <HeaderPanelLink>Switcher item 1</HeaderPanelLink>
                </HeaderPanelLinks>
            </HeaderAction>
            <HeaderAction bind:isModuleSwitcherOpen transition={transitions[selected].value}>
                <HeaderPanelLinks>
                    <HeaderPanelDivider>Switcher subject 1</HeaderPanelDivider>
                    <HeaderPanelLink>Switcher item 1</HeaderPanelLink>
                    <HeaderPanelDivider>Switcher subject 2</HeaderPanelDivider>
                    <HeaderPanelLink>Switcher item 1</HeaderPanelLink>
                    <HeaderPanelLink>Switcher item 2</HeaderPanelLink>
                    <HeaderPanelLink>Switcher item 3</HeaderPanelLink>
                    <HeaderPanelLink>Switcher item 4</HeaderPanelLink>
                    <HeaderPanelLink>Switcher item 5</HeaderPanelLink>
                </HeaderPanelLinks>
            </HeaderAction>
        </HeaderUtilities>
    {/if}
</Header>
<Content black>
    {#if isAuthorized && $userInfo}
        <Breadcrumb noTrailingSlash>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/profile" isCurrentPage>Profile</BreadcrumbItem>
        </Breadcrumb>
        <slot />
    {:else}
        {#if isAuthorized && $userInfo === null}
            <InlineNotification
                    hideCloseButton
                    title="오류:"
                    subtitle="인증 토큰을 이용하여 유저 정보를 가져오지 못했습니다. 다시 로그인하세요."
            />
        {/if}
        {#if !isAuthorized || $userInfo === null}
            <h1>인증 필요</h1>
            <p>이 페이지를 볼 수 있는 권한이 없습니다. 로그인하여 페이지를 열람하세요.</p>
            <Button href="/" kind="danger" >메인 페이지로 돌아가기</Button>
        {/if}
    {/if}
</Content>