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

  async function fetchContainers() {
    try {
      data = await invoke("docker_ps");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch containers");
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
    if (action === 'start') handleStart(name);
    else if (action === 'stop') handleStop(name);
    else if (action === 'remove') handleRemove(name);
  }

  async function handleStart(name) {
    const key = `start-${name}`;
    setRowLoading(key, true);
    try {
      const started = await invoke("docker_start_container", { name });
      toast.success(`Started container: ${started}`);
      await fetchContainers();
    } catch (err) {
      toast.error(`Start failed: ${err}`);
    } finally {
      setRowLoading(key, false);
    }
  }

  async function handleStop(name) {
    const key = `stop-${name}`;
    setRowLoading(key, true);
    try {
      const stopped = await invoke("docker_stop_container", { name });
      toast.success(`Stopped container: ${stopped}`);
      await fetchContainers();
    } catch (err) {
      toast.error(`Stop failed: ${err}`);
    } finally {
      setRowLoading(key, false);
    }
  }

  async function handleRemove(name) {
    const key = `remove-${name}`;
    setRowLoading(key, true);
    try {
      const removed = await invoke("docker_remove_container", { name });
      toast.success(`Removed container: ${removed}`);
      await fetchContainers();
    } catch (err) {
      toast.error(`Remove failed: ${err}`);
    } finally {
      setRowLoading(key, false);
    }
  }

  const columns = $derived([
    { header: "Name", accessorKey: "Names" },
    { header: "Image", accessorKey: "Image" },
    {
      header: "Status",
      accessorKey: "Status",
      cell: (info) => renderComponent(CellRenderer, { type: 'status', value: info.getValue() })
    },
    {
      header: "Ports",
      accessorKey: "Ports",
      cell: (info) => renderComponent(CellRenderer, { type: 'ports', value: info.getValue() })
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => renderComponent(CellRenderer, {
        type: 'container_actions',
        row: info.row,
        loadingRows,
        onAction: handleAction
      })
    },
  ]);

  onMount(() => {
    fetchContainers();
  });
</script>

<div class="p-5">
  <DataTable {data} {columns} {loading} emptyMessage="No containers found" />
</div>
