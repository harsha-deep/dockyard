<script>
  import { onMount } from "svelte";
  import { invoke } from "@tauri-apps/api/core";
  import { toast } from "svelte-sonner";
  import { renderComponent } from "../lib/renderComponent.js";
  import DataTable from "./DataTable.svelte";
  import CellRenderer from "./CellRenderer.svelte";

  let data = $state([]);
  let loading = $state(true);
  let loadingRows = $state(new Set());

  async function fetchNetworks() {
    try {
      data = await invoke("docker_networks");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch networks");
    } finally {
      loading = false;
    }
  }

  function setRowLoading(key, isLoading) {
    const next = new Set(loadingRows);
    if (isLoading) next.add(key);
    else next.delete(key);
    loadingRows = next;
  }

  function handleAction(action, id, name) {
    if (action === 'remove') handleRemove(id, name);
  }

  async function handleRemove(id, name) {
    const key = `remove-${id}`;
    setRowLoading(key, true);
    try {
      await invoke("docker_remove_network", { id });
      toast.success(`Removed network: ${name}`);
      await fetchNetworks();
    } catch (err) {
      toast.error(`Remove failed: ${err}`);
    } finally {
      setRowLoading(key, false);
    }
  }

  const columns = $derived([
    { header: "ID", accessorKey: "ID" },
    { header: "Name", accessorKey: "Name" },
    { header: "Driver", accessorKey: "Driver" },
    { header: "Scope", accessorKey: "Scope" },
    { header: "IPv6", accessorKey: "IPv6" },
    { header: "Internal", accessorKey: "Internal" },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => renderComponent(CellRenderer, {
        type: 'network_actions',
        row: info.row,
        loadingRows,
        onAction: handleAction
      })
    },
  ]);

  onMount(() => {
    fetchNetworks();
  });
</script>

<div class="p-5">
  <DataTable {data} {columns} {loading} emptyMessage="No networks found" />
</div>
