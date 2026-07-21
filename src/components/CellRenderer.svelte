<script>
  let { type, value, row, loadingRows, onAction } = $props();
</script>

{#if type === 'status'}
  {@const isRunning = value?.toLowerCase().includes("up")}
  <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium {isRunning ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}">
    {value}
  </span>

{:else if type === 'ports'}
  {#if !value}
    <span class="text-gray-400 dark:text-[#6B6B6B] text-xs">—</span>
  {:else}
    <div class="flex flex-wrap gap-1">
      {#each value.split(", ") as p}
        <span class="inline-block px-2 py-0.5 rounded text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
          {p}
        </span>
      {/each}
    </div>
  {/if}

{:else if type === 'container_actions'}
  {@const name = row.original.Names}
  {@const status = row.original.Status ?? ""}
  {@const isRunning = status.toLowerCase().includes("up")}
  {@const starting = loadingRows.has(`start-${name}`)}
  {@const stopping = loadingRows.has(`stop-${name}`)}
  {@const removing = loadingRows.has(`remove-${name}`)}
  {@const busy = starting || stopping || removing}
  
  <div class="flex gap-2">
    {#if isRunning}
      <button disabled={busy} onclick={() => onAction('stop', name)} class="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed {stopping ? 'opacity-60' : ''}">
        {stopping ? "Stopping…" : "Stop"}
      </button>
    {:else}
      <button disabled={busy} onclick={() => onAction('start', name)} class="px-2.5 py-1 rounded-md text-xs font-medium bg-green-500 hover:bg-green-600 text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed {starting ? 'opacity-60' : ''}">
        {starting ? "Starting…" : "Start"}
      </button>
    {/if}
    <button disabled={busy} onclick={() => onAction('remove', name)} class="px-2.5 py-1 rounded-md text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed {removing ? 'opacity-60' : ''}">
      {removing ? "Removing…" : "Remove"}
    </button>
  </div>

{:else if type === 'image_actions'}
  {@const id = row.original.ID}
  {@const deleting = loadingRows.has(`delete-${id}`)}
  <button disabled={deleting} onclick={() => onAction('delete', id)} class="px-2.5 py-1 rounded-md text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
    {deleting ? "Deleting…" : "Delete"}
  </button>

{:else if type === 'volume_actions'}
  {@const name = row.original.Name}
  {@const removing = loadingRows.has(`remove-${name}`)}
  <button disabled={removing} onclick={() => onAction('remove', name)} class="px-2.5 py-1 rounded-md text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
    {removing ? "Removing…" : "Remove"}
  </button>

{:else if type === 'network_actions'}
  {@const id = row.original.ID}
  {@const name = row.original.Name}
  {@const isBuiltin = ["bridge", "host", "none"].includes(name)}
  {@const removing = loadingRows.has(`remove-${id}`)}
  <button disabled={isBuiltin || removing} onclick={() => onAction('remove', id, name)} title={isBuiltin ? "Built-in network cannot be removed" : undefined} class="px-2.5 py-1 rounded-md text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
    {removing ? "Removing…" : "Remove"}
  </button>

{:else if type === 'service_actions'}
  {@const service = row.original.Service}
  {@const stopping = loadingRows.has(`stop-${service}`)}
  {@const removing = loadingRows.has(`remove-${service}`)}
  {@const busy = stopping || removing}
  {@const servicePath = row.original._servicePath}
  <div class="flex gap-2">
    <button disabled={busy || !servicePath} onclick={() => onAction('stop', service)} class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed {servicePath ? 'bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-60' : 'bg-gray-200 dark:bg-[#3C3C3C] text-gray-500 dark:text-[#9E9E9E]'}">
      {stopping ? "Stopping…" : "Stop"}
    </button>
    <button disabled={busy || !servicePath} onclick={() => onAction('remove', service)} class="px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer disabled:cursor-not-allowed {servicePath ? 'bg-red-500 hover:bg-red-600 text-white disabled:opacity-60' : 'bg-gray-200 dark:bg-[#3C3C3C] text-gray-500 dark:text-[#9E9E9E]'}">
      {removing ? "Removing…" : "Remove"}
    </button>
  </div>

{/if}
