<script>
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { open } from "@tauri-apps/plugin-dialog";
  import { toast } from "svelte-sonner";
  import { renderComponent } from "../lib/renderComponent.js";
  import DataTable from "./DataTable.svelte";
  import CellRenderer from "./CellRenderer.svelte";

  let data = $state([]);
  let loading = $state(false);
  let servicePath = $state(null);
  let loadingRows = $state(new Set());

  async function fetchServices() {
    if (!servicePath) {
      data = [];
      return;
    }
    loading = true;
    try {
      const result = await invoke("docker_services", { path: servicePath });
      data = result.map(item => ({ ...item, _servicePath: servicePath }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch services");
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    fetchServices();
  });

  function setRowLoading(key, isLoading) {
    const next = new Set(loadingRows);
    if (isLoading) next.add(key);
    else next.delete(key);
    loadingRows = next;
  }

  async function handleBrowse() {
    const dir = await open({
      directory: true,
      multiple: false,
      title: "Select compose directory",
    });
    if (dir) servicePath = dir;
  }

  function handleAction(action, service) {
    if (action === 'stop') handleStop(service);
    else if (action === 'remove') handleRemove(service);
  }

  async function handleStop(service) {
    if (!servicePath) {
      toast.warning("Select the compose folder first");
      return;
    }
    const key = `stop-${service}`;
    setRowLoading(key, true);
    try {
      const stopped = await invoke("docker_compose_stop_service", {
        path: servicePath,
        service,
      });
      toast.success(`Stopped service: ${stopped}`);
      await fetchServices();
    } catch (err) {
      toast.error(`Stop failed: ${err}`);
    } finally {
      setRowLoading(key, false);
    }
  }

  async function handleRemove(service) {
    if (!servicePath) {
      toast.warning("Select the compose folder first");
      return;
    }
    const key = `remove-${service}`;
    setRowLoading(key, true);
    try {
      const removed = await invoke("docker_compose_remove_service", {
        path: servicePath,
        service,
      });
      toast.success(`Removed service: ${removed}`);
      await fetchServices();
    } catch (err) {
      toast.error(`Remove failed: ${err}`);
    } finally {
      setRowLoading(key, false);
    }
  }

  const columns = $derived([
    { header: "Service", accessorKey: "Service" },
    { header: "Image", accessorKey: "Image" },
    { header: "Status", accessorKey: "Status" },
    {
      header: "Ports",
      accessorKey: "Ports",
      cell: (info) => renderComponent(CellRenderer, { type: 'ports', value: info.getValue() })
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => renderComponent(CellRenderer, {
        type: 'service_actions',
        row: info.row,
        loadingRows,
        onAction: handleAction
      })
    },
  ]);
</script>

<div class="p-5">
  <div class="flex items-center gap-3 mb-4 px-4 py-3 bg-white dark:bg-[#252526] rounded-xl shadow-sm">
    <button
      onclick={handleBrowse}
      class="px-3.5 py-1.5 rounded-lg border border-gray-300 dark:border-[#3C3C3C] text-sm font-medium bg-gray-50 dark:bg-[#2D2D2D] text-gray-700 dark:text-[#D4D4D4] hover:bg-gray-100 dark:hover:bg-[#2A2D2E] transition-colors cursor-pointer"
    >
      Browse
    </button>
    <span
      class="text-sm font-mono {servicePath ? 'text-gray-900 dark:text-[#D4D4D4]' : 'text-gray-400 dark:text-[#9E9E9E]'}"
    >
      {servicePath ?? "No folder selected — pick the folder containing your compose file"}
    </span>
  </div>

  <DataTable {data} {columns} {loading} emptyMessage="No services found" />
</div>
