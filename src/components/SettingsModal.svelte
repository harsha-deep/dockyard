<script>
  import { check } from "@tauri-apps/plugin-updater";
  import { relaunch } from "@tauri-apps/plugin-process";

  let { darkMode, onToggleDark, onClose } = $props();

  let updateStatus = $state(null); // null | "checking" | "available" | "downloading" | "up-to-date" | "error"
  let updateError = $state(null);

  async function checkForUpdates() {
    updateStatus = "checking";
    updateError = null;
    try {
      const update = await check();
      if (update) {
        updateStatus = "downloading";
        await update.downloadAndInstall();
        updateStatus = "available";
        await relaunch();
      } else {
        updateStatus = "up-to-date";
      }
    } catch (err) {
      updateStatus = "error";
      updateError = err?.toString() || "Update check failed";
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
  onclick={onClose}
>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="bg-white dark:bg-[#252526] rounded-2xl shadow-2xl w-96 p-6 flex flex-col gap-5"
    onclick={(e) => e.stopPropagation()}
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-[#D4D4D4]">
        Settings
      </h2>
      <button
        onclick={onClose}
        class="text-gray-400 dark:text-[#9E9E9E] hover:text-gray-600 dark:hover:text-[#D4D4D4] cursor-pointer transition-colors"
        aria-label="Close settings"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="w-5 h-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <hr class="border-gray-200 dark:border-[#3C3C3C]" />

    <!-- Dark Mode Row -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#2D2D2D] flex items-center justify-center">
          {#if darkMode}
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-4 h-4 text-blue-400"
            >
              <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
            </svg>
          {:else}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="w-4 h-4 text-amber-500"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" stroke-linecap="round" />
              <line x1="12" y1="21" x2="12" y2="23" stroke-linecap="round" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke-linecap="round" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke-linecap="round" />
              <line x1="1" y1="12" x2="3" y2="12" stroke-linecap="round" />
              <line x1="21" y1="12" x2="23" y2="12" stroke-linecap="round" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke-linecap="round" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke-linecap="round" />
            </svg>
          {/if}
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-[#D4D4D4]">
            Dark Mode
          </p>
          <p class="text-xs text-gray-500 dark:text-[#9E9E9E]">
            {darkMode ? "Dark theme active" : "Light theme active"}
          </p>
        </div>
      </div>

      <!-- Toggle switch -->
      <button
        role="switch"
        aria-label="Toggle dark mode"
        aria-checked={darkMode}
        onclick={onToggleDark}
        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 {darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-[#3C3C3C]'}"
      >
        <span
          class="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform {darkMode ? 'translate-x-6' : 'translate-x-1'}"
        ></span>
      </button>
    </div>

    <hr class="border-gray-200 dark:border-[#3C3C3C]" />

    <!-- Check for Updates Row -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#2D2D2D] flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="w-4 h-4 text-green-500"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900 dark:text-[#D4D4D4]">
            Updates
          </p>
          <p class="text-xs text-gray-500 dark:text-[#9E9E9E]">
            {#if updateStatus === "checking"}Checking for updates…
            {:else if updateStatus === "downloading"}Downloading update…
            {:else if updateStatus === "up-to-date"}You're on the latest version
            {:else if updateStatus === "error"}{updateError || "Update check failed"}
            {:else}Check for new versions
            {/if}
          </p>
        </div>
      </div>
      <button
        onclick={checkForUpdates}
        disabled={updateStatus === "checking" || updateStatus === "downloading"}
        class="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        {updateStatus === "checking" || updateStatus === "downloading" ? "Checking…" : "Check"}
      </button>
    </div>
  </div>
</div>
