<script>
  import { invoke } from "@tauri-apps/api/core";
  import { toast } from "svelte-sonner";

  let { settings = $bindable() } = $props();

  let showAddModal = $state(false);
  let newEnv = $state({
    name: "",
    host: "",
    port: 22,
    username: "",
    password: "",
  });

  async function saveAndApplySettings(newSettings) {
    try {
      await invoke("save_settings", { newSettings });
      settings = newSettings;
      toast.success("Settings saved");
    } catch (e) {
      toast.error(`Failed to save settings: ${e}`);
    }
  }

  async function handleSetActive(envId) {
    const updated = { ...settings, active_env_id: envId };
    await saveAndApplySettings(updated);
  }

  async function handleDelete(envId) {
    if (envId === "local") return;
    
    const newActiveId = settings.active_env_id === envId ? "local" : settings.active_env_id;
    
    const updated = {
      ...settings,
      active_env_id: newActiveId,
      environments: settings.environments.filter((e) => {
        if (e.type === "Local") return true;
        return e.id !== envId;
      }),
    };
    await saveAndApplySettings(updated);
  }

  async function handleAddSubmit(e) {
    e.preventDefault();
    const env = {
      type: "Ssh",
      id: crypto.randomUUID(),
      name: newEnv.name,
      host: newEnv.host,
      port: parseInt(newEnv.port, 10),
      username: newEnv.username,
      password: newEnv.password || null,
    };

    const updated = {
      ...settings,
      environments: [...settings.environments, env],
    };
    await saveAndApplySettings(updated);
    showAddModal = false;
    newEnv = { name: "", host: "", port: 22, username: "", password: "" };
  }
</script>

<div class="p-5">
  <div class="flex justify-between items-center mb-6">
    <h3 class="text-lg font-medium">Manage Environments</h3>
    <button
      onclick={() => showAddModal = true}
      class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
    >
      Add SSH Environment
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {#each settings.environments as env}
      {@const isLocal = env.type === "Local"}
      {@const id = isLocal ? "local" : env.id}
      {@const isActive = settings.active_env_id === id}
      
      <div class="p-4 rounded-xl border {isActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-[#3C3C3C] bg-white dark:bg-[#252526]'} shadow-sm transition-all">
        <div class="flex justify-between items-start mb-3">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full {isActive ? 'bg-green-500' : 'bg-gray-400'}"></div>
            <h4 class="font-semibold text-lg">{isLocal ? "Local Machine" : env.name}</h4>
          </div>
          {#if isActive}
            <span class="text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 px-2 py-1 rounded-full font-medium">
              Active
            </span>
          {/if}
        </div>
        
        {#if !isLocal}
          <div class="text-sm text-gray-600 dark:text-[#9E9E9E] mb-4">
            <p>{env.username}@{env.host}:{env.port}</p>
          </div>
        {/if}
        {#if isLocal}
          <div class="text-sm text-gray-600 dark:text-[#9E9E9E] mb-4">
            <p>Uses local Docker daemon</p>
          </div>
        {/if}

        <div class="flex gap-2 mt-auto">
          {#if !isActive}
            <button
              onclick={() => handleSetActive(id)}
              class="flex-1 bg-gray-100 dark:bg-[#3C3C3C] hover:bg-gray-200 dark:hover:bg-[#4D4D4D] px-3 py-1.5 rounded text-sm font-medium transition-colors"
            >
              Connect
            </button>
          {/if}
          {#if !isLocal}
            <button
              onclick={() => handleDelete(id)}
              class="flex-none text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded text-sm font-medium transition-colors"
            >
              Delete
            </button>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  {#if showAddModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onclick={() => showAddModal = false}>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="bg-white dark:bg-[#252526] rounded-2xl shadow-2xl w-full max-w-md p-6" onclick={e => e.stopPropagation()}>
        <h2 class="text-xl font-semibold mb-4">Add SSH Environment</h2>
        <form onsubmit={handleAddSubmit} class="flex flex-col gap-4">
          <div>
            <label for="env-name" class="block text-sm font-medium mb-1">Name</label>
            <input
              id="env-name"
              required
              type="text"
              bind:value={newEnv.name}
              class="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#3C3C3C] rounded-lg px-3 py-2 outline-none focus:border-blue-500"
              placeholder="Production Server"
            />
          </div>
          <div class="flex gap-4">
            <div class="flex-[3]">
              <label for="env-host" class="block text-sm font-medium mb-1">Host</label>
              <input
                id="env-host"
                required
                type="text"
                bind:value={newEnv.host}
                class="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#3C3C3C] rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                placeholder="192.168.1.100"
              />
            </div>
            <div class="flex-1">
              <label for="env-port" class="block text-sm font-medium mb-1">Port</label>
              <input
                id="env-port"
                required
                type="number"
                bind:value={newEnv.port}
                class="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#3C3C3C] rounded-lg px-3 py-2 outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label for="env-username" class="block text-sm font-medium mb-1">Username</label>
            <input
              id="env-username"
              required
              type="text"
              bind:value={newEnv.username}
              class="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#3C3C3C] rounded-lg px-3 py-2 outline-none focus:border-blue-500"
              placeholder="root"
            />
          </div>
          <div>
            <label for="env-password" class="block text-sm font-medium mb-1">Password</label>
            <input
              id="env-password"
              type="password"
              bind:value={newEnv.password}
              class="w-full bg-gray-50 dark:bg-[#1E1E1E] border border-gray-200 dark:border-[#3C3C3C] rounded-lg px-3 py-2 outline-none focus:border-blue-500"
              placeholder="Optional (if using agent, though not supported yet)"
            />
          </div>
          
          <div class="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onclick={() => showAddModal = false}
              class="px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-[#3C3C3C] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Add Environment
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>
