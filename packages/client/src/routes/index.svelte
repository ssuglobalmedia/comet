<script lang='ts'>
    import {variables} from "$lib/variables";
    import {onMount} from "svelte";
    import {Button} from "carbon-components-svelte";

    const baseUrl = variables.baseUrl ?? '';
    let api
    onMount(() => {
        api = fetch(baseUrl + '/api/example').then((res) => res.json());
    })
</script>

<svelte:head>
    <title>Lambda-Svelte Skeleton</title>
</svelte:head>

<p>Hello Client!</p>
<div>
    <h1>Response</h1>
    {#if api}
        {#await api}
            <p>Requested...</p>
        {:then data}
            <p>Response: {JSON.stringify(data)}</p>
        {:catch err}
            <p>Error: {err}</p>
        {/await}
    {:else}
        <p>Waiting...</p>
    {/if}
    <h1>CarbonTest</h1>
    <Button>버튼 스타일 테스트</Button>
</div>

