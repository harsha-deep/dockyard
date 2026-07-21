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

  async function fetchImages() {
    try {
      data = await invoke("docker_images");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch images");
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

  function handleAction(action, id) {
    if (action === 'delete') {
      const img = data.find(i => i.ID === id);
      const label = img && img.Repository !== "<none>" ? `${img.Repository}:${img.Tag}` : id;
      handleDelete(id, label);
    }
  }

  async function handleDelete(id, label) {
    const key = `delete-${id}`;
    setRowLoading(key, true);
    try {
      await invoke("docker_delete_image", { id });
      toast.success(`Deleted image: ${label}`);
      await fetchImages();
    } catch (err) {
      toast.error(`Delete failed: ${err}`);
    } finally {
      setRowLoading(key, false);
    }
  }

  let totalSize = $derived.by(() => {
    const toBytes = (sizeStr) => {
      if (!sizeStr) return 0;
      const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*(B|kB|MB|GB|TB)?$/i);
      if (!match) return 0;
      const n = parseFloat(match[1]);
      const unit = (match[2] ?? "B").toUpperCase();
      const units = { B: 1, KB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12 };
      return n * (units[unit] ?? 1);
    };
    const bytes = data.reduce((sum, img) => sum + toBytes(img.Size), 0);
    if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(2)} TB`;
    if (bytes >= 1e9)  return `${(bytes / 1e9).toFixed(2)} GB`;
    if (bytes >= 1e6)  return `${(bytes / 1e6).toFixed(2)} MB`;
    if (bytes >= 1e3)  return `${(bytes / 1e3).toFixed(2)} kB`;
    return `${bytes} B`;
  });

  const columns = $derived([
    { header: "Repository", accessorKey: "Repository" },
    { header: "Tag", accessorKey: "Tag" },
    { header: "ID", accessorKey: "ID" },
    { header: "Created", accessorKey: "CreatedSince" },
    { header: "Size", accessorKey: "Size" },
    {
      id: "actions",
      header: "Actions",
      cell: (info) => renderComponent(CellRenderer, {
        type: 'image_actions',
        row: info.row,
        loadingRows,
        onAction: handleAction
      })
    },
  ]);

  onMount(() => {
    fetchImages();
  });
</script>

<div class="p-5">
  {#if !loading && data.length > 0}
    <div class="mb-3 flex items-center gap-2 text-sm text-gray-600 dark:text-[#9E9E9E]">
      <span>{data.length} image{data.length !== 1 ? "s" : ""}</span>
      <span class="text-gray-300 dark:text-[#3C3C3C]">·</span>
      <span>Total size: <span class="font-semibold text-gray-800 dark:text-[#D4D4D4]">{totalSize}</span></span>
    </div>
  {/if}
  <DataTable {data} {columns} {loading} emptyMessage="No images found" />
</div>
