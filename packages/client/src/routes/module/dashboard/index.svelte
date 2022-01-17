<script>
    import ModuleDashboard from "../../../components/module/dashboard/ModuleDashboard.svelte";
    import {modules} from "$lib/modules.js";
    const filteredModules = {...modules};
    delete filteredModules.dashboard;
</script>


<ModuleDashboard modules={filteredModules} />