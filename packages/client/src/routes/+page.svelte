<script lang="ts">
  import { Button, Column, Content, Grid } from 'carbon-components-svelte';
  import Soongsil from '../icons/Soongsil.svelte';
  import { onMount } from 'svelte';
  import { getAuthorization } from '$lib/module/auth';
  import EntryCard from '../components/molcule/entry/EntryCard.svelte';

  let callbackUrl;
  let loginCookie;
  let redirect;
  onMount(() => {
    loginCookie = getAuthorization();
    if (loginCookie) {
      window.location.href = '/module/dashboard';
    }
    redirect = new URLSearchParams(window.location.search).get('redirect');
    callbackUrl =
      window.location.protocol +
      '//' +
      window.location.host +
      '/callback/' +
      (redirect ? `?redirect=${redirect}` : '');
  });
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
        <Button
          icon={Soongsil}
          style="width: 100%"
          skeleton={callbackUrl === undefined}
          href="https://class.ssu.ac.kr/xn-sso/gw.php?login_type=sso&callback_url={encodeURIComponent(
            callbackUrl,
          )}">
          숭실대학교로 로그인
        </Button>
      </EntryCard>
    </Column>
  </Grid>
</Content>
