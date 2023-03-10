<script lang="ts">
  import '../../styles/app.scss';
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
    Row,
    SkipToContent,
  } from 'carbon-components-svelte';
  import { expoIn } from 'svelte/easing';
  import { getAuthorization, isAccessible } from '$lib/module/auth';
  import { userInfo } from '$lib/stores';
  import { onMount } from 'svelte';
  import { UserAvatarFilledAlt20 } from 'carbon-icons-svelte';
  import { findPageByPath, modules } from '$lib/modules';
  import UserMenu from '../../lib/components/molcule/headeraction/UserMenu.svelte';
  import ModuleSwitcher from '../../lib/components/molcule/headeraction/ModuleSwitcher.svelte';
  import { afterNavigate } from '$app/navigation';
  import { browser } from '$app/environment';

  let isMounted = false;
  let isSideNavOpen;
  let isAuthorized = false;
  let isModuleSwitcherOpen = false;
  let isUserInfoOpen = false;
  let selected = '0';
  let breadcrumb = undefined;
  let currentPage = undefined;
  $: currentPath = browser ? window.location.pathname : undefined;
  let transitions = {
    '0': {
      text: 'Default (duration: 200ms)',
      value: { duration: 200 },
    },
    '1': {
      text: 'Custom (duration: 600ms, delay: 50ms, easing: expoIn)',
      value: { duration: 600, delay: 50, easing: expoIn },
    },
    '2': {
      text: 'Disabled',
      value: false,
    },
  };
  $: if ($userInfo === null) {
    if (browser) {
      document.cookie = `comet_session=; path=/; domain=${window.location.hostname}; max-age=-99999999; samesite=lax;`;
    }
  }

  if (browser) {
    if (getAuthorization()) {
      isAuthorized = true;
    }
    if (!isAuthorized || $userInfo === null) {
      document.cookie = `comet_session=; path=/; domain=${window.location.hostname}; max-age=-99999999; samesite=lax;`;
    }
  }

  const constructBreadcrumb = (path: string) =>
    path
      .split('/')
      .filter((v) => v.length > 0)
      .reduce((arr, v) => {
        let href = (arr.length ? arr[arr.length - 1].path : '') + `/${v}`;
        return [
          ...arr,
          {
            path: href,
            title: findPageByPath(href).title,
          },
        ];
      }, []);
  onMount(() => {
    isMounted = true;
    currentPage = findPageByPath(window.location.pathname.replace('/module', ''));
    breadcrumb = constructBreadcrumb(window.location.pathname.replace('/module', ''));
  });
  afterNavigate(({ to }) => {
    breadcrumb = constructBreadcrumb(to.url.pathname.replace('/module', ''));
  });
</script>

<svelte:head>
  <title
    >{isAuthorized && $userInfo
      ? (breadcrumb ?? ['?????? ???']).at(-1).title ?? '?????? ??? ??????'
      : '?????? ???'} - ????????? COMET</title>
</svelte:head>

<Header company="?????????" platformName="COMET" href="/module/dashboard" bind:isSideNavOpen>
  <svelte:fragment slot="skip-to-content">
    <SkipToContent />
  </svelte:fragment>
  <HeaderNav>
    {#if isAuthorized && $userInfo === undefined}
      <InlineLoading description="????????? ????????? ???????????? ???..." />
    {/if}
    <slot name="headerNav" />
  </HeaderNav>
  {#if isAuthorized && $userInfo}
    <HeaderUtilities>
      <HeaderAction
        class='inline-svg'
        bind:isOpen={isUserInfoOpen}
        icon={UserAvatarFilledAlt20}
        closeIcon={UserAvatarFilledAlt20}
        text={$userInfo.userName}
        transition={transitions[selected].value}>
        <UserMenu />
      </HeaderAction>
      <HeaderAction class='inline-svg' bind:isOpen={isModuleSwitcherOpen} transition={transitions[selected].value}>
        <ModuleSwitcher {modules} />
      </HeaderAction>
    </HeaderUtilities>
  {/if}
</Header>
<slot name="sidebar" />
<Content black>
  {#if isAuthorized && $userInfo && isAccessible($userInfo, currentPage?.accessibleGroup)}
    <Grid class="my-4">
      <Row>
        <Column>
          {#if breadcrumb}
            <Breadcrumb noTrailingSlash>
              {#each breadcrumb as item, i}
                <BreadcrumbItem
                  href="/module{item.path}"
                  isCurrentPage={i === breadcrumb.length - 1}>{item.title}</BreadcrumbItem>
              {/each}
            </Breadcrumb>
          {:else}
            <Breadcrumb noTrailingSlash>
              <BreadcrumbItem skeleton />
            </Breadcrumb>
          {/if}
        </Column>
      </Row>
      <Row>
        <Column>
          <slot />
        </Column>
      </Row>
    </Grid>
  {:else}
    {#if isMounted && isAuthorized && $userInfo === null}
      <InlineNotification
        hideCloseButton
        title="??????:"
        subtitle="?????? ????????? ???????????? ?????? ????????? ???????????? ???????????????. ?????? ??????????????????." />
    {/if}
    {#if isMounted && (!isAuthorized || $userInfo === null)}
      <h1>?????? ??????</h1>
      <p>??? ???????????? ??? ??? ?????? ????????? ????????????. ??????????????? ???????????? ???????????????.</p>
      <Button href={`/${currentPath ? '?redirect=' + currentPath : ''}`} kind="danger"
        >?????? ???????????? ????????????</Button>
    {:else if isMounted && $userInfo !== undefined && !isAccessible($userInfo, currentPage?.accessibleGroup)}
      <h1>?????? ??????</h1>
      <p>??? ???????????? ??? ??? ?????? ????????? ????????????.</p>
      <Button href="/module/dashboard" kind="danger">??????????????? ????????????</Button>
    {/if}
  {/if}
</Content>
