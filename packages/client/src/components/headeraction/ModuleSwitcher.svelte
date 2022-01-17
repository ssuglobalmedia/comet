<script lang="ts">
    import {HeaderPanelDivider, HeaderPanelLink, HeaderPanelLinks} from "carbon-components-svelte";
    import {groupDisplayName} from "$lib/module/auth";
    import type {ModuleDefinition} from "../../global";

    export let modules: Record<string, ModuleDefinition>;

    $: modulesByGroup = Object.entries(modules).reduce<Record<string, ModuleDefinition[]>>((map, value) => {
        const groupMembers = map[value[1].accessibleGroup] ?? [];
        let ret = {...map}
        ret[value[1].accessibleGroup] = [...groupMembers, value[1]]
        return ret;
    }, {});
</script>

<HeaderPanelLinks>
    {#each Object.entries(modulesByGroup) as [group, modules]}
        <HeaderPanelDivider>{groupDisplayName[group]}</HeaderPanelDivider>
        {#each modules as module}
            <HeaderPanelLink href="/module/{module.module}">{module.title}</HeaderPanelLink>
        {/each}
    {/each}
</HeaderPanelLinks>