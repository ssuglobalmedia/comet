<script>
    import ModuleDashboard from "../../../components/molcule/module/dashboard/ModuleDashboard.svelte";
    import {modules} from "$lib/modules";
    const filteredModules = {...modules};
    delete filteredModules.dashboard;
</script>


<ModuleDashboard modules={filteredModules} />