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

  async function fetchVolumes() {
    try {
      data = await invoke("docker_volumes");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch volumes");
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

  function handleAction(action, name) {
    if (action === 'remove') handleRemove(name);
  }

  async function handleRemove(name) {
    const key = `remove-${name}`;
    setRowLoading(key, true);
    try {
      await invoke("docker_remove_volume", { name });
      toast.success(`Removed volume: ${name}`);
      await fetchVolumes();
    } catch (err) {
      toast.error(`Remove failed: ${err}`);
    } finally {
      setRowLoading(key, false);
    }
  }

  const columns = $derived([
    { header: "Name", accessorKey: "Name" },
    { header: "Driver", accessorKey: "Driver" },
    { header: "Scope", accessorKey: "Scope" },
    { header: "Mountpoint", accessorKey: "Mountpoint" },
    { header: "Labels", accessorKey: "Labels" },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => renderComponent(CellRenderer, {
        type: 'volume_actions',
        row: info.row,
        loadingRows,
        onAction: handleAction
      })
    },
  ]);

  onMount(() => {
    fetchVolumes();
  });
</script>

<div class="p-5">
  <DataTable {data} {columns} {loading} emptyMessage="No volumes found" />
</div>
