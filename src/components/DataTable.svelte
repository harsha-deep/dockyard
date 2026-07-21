<script>
  /**
   * DataTable – a simple table component that does NOT use @tanstack/svelte-table.
   *
   * Props:
   *   data          – array of row objects
   *   columns       – array of column descriptors:
   *     {
   *       header       – string (header text)
   *       accessorKey  – string (key to read from row, optional if `cell` is provided)
   *       id           – string (optional, defaults to accessorKey)
   *       cell         – function(info) => string | number | { component, props }
   *                      info = { getValue: () => any, row: { original, id } }
   *     }
   *   loading       – boolean – show loading spinner
   *   emptyMessage  – string – shown when data is empty & not loading
   */
  let { data, columns, loading, emptyMessage = "No data found" } = $props();

  /**
   * Build the info object passed to cell() functions.
   */
  function cellInfo(row, rowIndex, col) {
    return {
      getValue: () => row[col.accessorKey],
      row: { original: row, id: rowIndex },
    };
  }
</script>

<div class="bg-white dark:bg-[#252526] rounded-xl shadow-sm overflow-x-auto">
  {#if loading}
    <div class="flex items-center justify-center py-16">
      <div class="apple-spinner">
        {#each Array(12) as _, i}
          <div class="spoke bg-gray-500 dark:bg-[#9E9E9E]"></div>
        {/each}
      </div>
    </div>
  {:else}
    <table class="w-full text-sm border-collapse">
      <thead class="bg-gray-50 dark:bg-[#2D2D2D] sticky top-0 z-10">
        <tr>
          {#each columns as col (col.id || col.accessorKey || col.header)}
            <th
              class="text-left px-4 py-3 font-semibold text-gray-700 dark:text-[#D4D4D4] border-b border-gray-200 dark:border-[#3C3C3C]"
            >
              {col.header}
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#if data.length === 0}
          <tr>
            <td
              colspan={columns.length}
              class="px-4 py-10 text-center text-gray-500 dark:text-[#9E9E9E]"
            >
              {emptyMessage}
            </td>
          </tr>
        {:else}
          {#each data as row, rowIndex (rowIndex)}
            <tr class="hover:bg-gray-50 dark:hover:bg-[#2A2D2E] transition-colors">
              {#each columns as col (col.id || col.accessorKey || col.header)}
                <td
                  class="px-4 py-3 border-b border-gray-100 dark:border-[#3C3C3C] text-gray-900 dark:text-[#D4D4D4]"
                >
                  {#if col.cell}
                    {@const info = cellInfo(row, rowIndex, col)}
                    {@const cellResult = col.cell(info)}
                    {#if cellResult && typeof cellResult === 'object' && cellResult.component}
                      {@const Comp = cellResult.component}
                      <Comp {...cellResult.props} />
                    {:else if cellResult != null}
                      {cellResult}
                    {/if}
                  {:else if col.accessorKey}
                    {row[col.accessorKey] ?? ""}
                  {/if}
                </td>
              {/each}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  {/if}
</div>
