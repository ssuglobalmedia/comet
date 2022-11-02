<script>
  import ModuleDashboard from '../../../lib/components/molcule/module/dashboard/ModuleDashboard.svelte';
  import { modules } from '$lib/modules';
  const filteredModules = { ...modules };
  delete filteredModules.dashboard;
</script>

<ModuleDashboard modules={filteredModules} />
