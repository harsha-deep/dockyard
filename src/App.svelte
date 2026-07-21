<script>
  import { onMount, onDestroy } from "svelte";
  import { listen } from "@tauri-apps/api/event";
  import { invoke } from "@tauri-apps/api/core";
  import { Toaster } from "svelte-sonner";
  import { MENU, REFRESH_INTERVAL } from "./constants";
  
  import ContainersView from "./components/ContainersView.svelte";
  import ImagesView from "./components/ImagesView.svelte";
  import ServicesView from "./components/ServicesView.svelte";
  import NetworksView from "./components/NetworksView.svelte";
  import VolumesView from "./components/VolumesView.svelte";
  import EnvironmentsView from "./components/EnvironmentsView.svelte";
  import AboutModal from "./components/AboutModal.svelte";
  import SettingsModal from "./components/SettingsModal.svelte";

  let view = $state("containers");
  let showAbout = $state(false);
  let showSettings = $state(false);
  let settings = $state({ environments: [], active_env_id: "local" });

  let darkMode = $state(false);

  onMount(() => {
    const stored = localStorage.getItem("darkMode");
    darkMode = stored !== null ? stored === "true" : false;
  });

  $effect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  });

  function toggleDark() {
    darkMode = !darkMode;
  }

  let unlistenPromise;
  let interval;

  onMount(() => {
    invoke("get_settings").then(s => settings = s).catch(console.error);

    interval = setInterval(() => {}, REFRESH_INTERVAL);

    unlistenPromise = listen("menu-event", (event) => {
      const id = event.payload;

      switch (id) {
        case MENU.CONTAINERS: view = "containers"; break;
        case MENU.IMAGES: view = "images"; break;
        case MENU.SERVICES: view = "services"; break;
        case MENU.NETWORKS: view = "networks"; break;
        case MENU.VOLUMES: view = "volumes"; break;
        case MENU.ENVIRONMENTS: view = "environments"; break;
        case MENU.SETTINGS: showSettings = true; break;
        case MENU.ABOUT: showAbout = true; break;
        default: console.log("Unhandled menu:", id);
      }
    });
  });

  onDestroy(() => {
    clearInterval(interval);
    if (unlistenPromise) unlistenPromise.then((unlisten) => unlisten());
  });
</script>

<div class="min-h-screen bg-gray-50 dark:bg-[#1E1E1E] text-gray-900 dark:text-[#D4D4D4] transition-colors">
  <Toaster richColors closeButton position="bottom-right" />

  <div class="px-5 pt-5 pb-2">
    <h2 class="text-xl font-semibold capitalize">{view}</h2>
  </div>

  {#if view === "containers"}
    <ContainersView />
  {:else if view === "images"}
    <ImagesView />
  {:else if view === "services"}
    <ServicesView />
  {:else if view === "networks"}
    <NetworksView />
  {:else if view === "volumes"}
    <VolumesView />
  {:else if view === "environments"}
    <EnvironmentsView bind:settings />
  {/if}

  {#if showSettings}
    <SettingsModal 
      {darkMode} 
      onToggleDark={toggleDark} 
      onClose={() => showSettings = false} 
    />
  {/if}

  {#if showAbout}
    <AboutModal onClose={() => showAbout = false} />
  {/if}
</div>
