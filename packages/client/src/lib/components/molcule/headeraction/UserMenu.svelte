<script>
  import {
    HeaderPanelDivider,
    HeaderPanelLink,
    HeaderPanelLinks,
    Tile,
  } from 'carbon-components-svelte';
  import { userInfo } from '$lib/stores.js';
  import { groupDisplayName } from '$lib/module/auth.js';
</script>

<Tile>
  <h4>안녕하세요,</h4>
  <h3>{$userInfo.userName ?? $userInfo.userId}님</h3>
  <h5>{$userInfo.userId}</h5>
  <h5>{groupDisplayName[$userInfo.userGroup]}</h5>
</Tile>
<HeaderPanelLinks>
  <HeaderPanelDivider>작업</HeaderPanelDivider>
  <HeaderPanelLink href="/logout">로그아웃</HeaderPanelLink>
</HeaderPanelLinks>
