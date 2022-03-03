<script lang="ts">
  import "../../styles/app.css";
  import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    Column,
    Content,
    Grid,
    Header,
    HeaderAction,
    HeaderNav,
    HeaderUtilities,
    InlineLoading,
    InlineNotification,
    SkipToContent
  } from "carbon-components-svelte";
  import { expoIn } from "svelte/easing";
  import { getAuthorization, isAccessible } from "$lib/module/auth";
  import { userInfo } from "$lib/stores";
  import { onMount } from "svelte";
  import { UserAvatarFilledAlt20 } from "carbon-icons-svelte";
  import { findPageByPath, modules } from "$lib/modules";
  import UserMenu from "../../components/headeraction/UserMenu.svelte";
  import ModuleSwitcher from "../../components/headeraction/ModuleSwitcher.svelte";
  import { afterNavigate } from "$app/navigation";
  import { browser } from "$app/env";

  let isMounted = false;
  let isSideNavOpen;
  let isAuthorized = false;
  let isModuleSwitcherOpen = false;
  let isUserInfoOpen = false;
  let selected = "0";
  let breadcrumb = undefined;
  let currentPage = undefined;
  let transitions = {
    "0": {
      text: "Default (duration: 200ms)",
      value: { duration: 200 }
    },
    "1": {
      text: "Custom (duration: 600ms, delay: 50ms, easing: expoIn)",
      value: { duration: 600, delay: 50, easing: expoIn }
    },
    "2": {
      text: "Disabled",
      value: false
    }
  };
  $: if ($userInfo === null) {
    if (browser) {
      document.cookie = `comet_session=; path=/; domain=${window.location.hostname}; max-age=-99999999; samesite=lax;`;
    }
  }

  if(browser) {
    if (getAuthorization()) {
      isAuthorized = true;
    }
    if (!isAuthorized || $userInfo === null) {
      document.cookie = `comet_session=; path=/; domain=${window.location.hostname}; max-age=-99999999; samesite=lax;`;
    }
  }

  const constructBreadcrumb = (path: string) => path.split("/").filter((v) => v.length > 0).reduce((arr, v) => {
    let href = (arr.length ? arr.at(-1).path : "") + `/${v}`;
    return [...arr, {
      path: href,
      title: findPageByPath(href).title
    }];
  }, []);
  onMount(() => {
    isMounted = true;
    currentPage = findPageByPath(window.location.pathname.replace("/module", ""));
    breadcrumb = constructBreadcrumb(window.location.pathname.replace("/module", ""));
  });
  afterNavigate(() => {
    breadcrumb = constructBreadcrumb(window.location.pathname.replace("/module", ""))
  });
</script>

<svelte:head>
  <title>{isAuthorized && $userInfo ? (breadcrumb ?? ['로드 중']).at(-1).title ?? '찾을 수 없음' : '인증 중'} - 미리내 COMET</title>
</svelte:head>

<Header company="미리내" platformName="COMET" bind:isSideNavOpen>
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>
  <HeaderNav>
    {#if isAuthorized && $userInfo === undefined}
      <InlineLoading description="사용자 정보를 가져오는 중..." />
    {/if}
    <slot name="headerNav" />
  </HeaderNav>
  {#if isAuthorized && $userInfo}
    <HeaderUtilities>
      <HeaderAction
        bind:isOpen={isUserInfoOpen}
        icon={UserAvatarFilledAlt20}
        closeIcon={UserAvatarFilledAlt20}
        text="{$userInfo.userName}"
        transition={transitions[selected].value}
      >
        <UserMenu />
      </HeaderAction>
      <HeaderAction bind:isOpen={isModuleSwitcherOpen} transition={transitions[selected].value}>
        <ModuleSwitcher {modules} />
      </HeaderAction>
    </HeaderUtilities>
  {/if}
</Header>
<slot name="sidebar" />
<Content black>
  {#if isAuthorized && $userInfo && isAccessible($userInfo, currentPage?.accessibleGroup)}
    <Grid class="my-4">
      <Column>
        {#if breadcrumb}
          <Breadcrumb noTrailingSlash>
            {#each breadcrumb as item, i}
              <BreadcrumbItem href="/module{item.path}"
                              isCurrentPage="{i === breadcrumb.length - 1}">{item.title}</BreadcrumbItem>
            {/each}
          </Breadcrumb>
        {:else}
          <Breadcrumb noTrailingSlash>
            <BreadcrumbItem skeleton />
          </Breadcrumb>
        {/if}
      </Column>
    </Grid>
    <Grid>
      <Column>
        <slot />
      </Column>
    </Grid>

  {:else}
    {#if isMounted && isAuthorized && $userInfo === null}
      <InlineNotification
        hideCloseButton
        title="오류:"
        subtitle="인증 토큰을 이용하여 유저 정보를 가져오지 못했습니다. 다시 로그인하세요."
      />
    {/if}
    {#if isMounted && (!isAuthorized || $userInfo === null)}
      <h1>인증 필요</h1>
      <p>이 페이지를 볼 수 있는 권한이 없습니다. 로그인하여 페이지를 열람하세요.</p>
      <Button href="/" kind="danger">메인 페이지로 돌아가기</Button>
    {:else if isMounted && $userInfo !== undefined && !isAccessible($userInfo, currentPage?.accessibleGroup)}
      <h1>권한 부족</h1>
      <p>이 페이지를 볼 수 있는 권한이 없습니다.</p>
      <Button href="/module/dashboard" kind="danger">대시보드로 돌아가기</Button>
    {/if}
  {/if}
</Content>