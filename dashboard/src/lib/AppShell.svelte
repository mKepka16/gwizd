<script lang="ts">
  import { AppShell } from '@skeletonlabs/skeleton';
  import LeftNav from './LeftNav.svelte';
  import Header from './Header.svelte';
  import MapPage from './Pages/MapPage.svelte';
  import { Route } from 'svelte-navigator';
  import StatsPage from './Pages/StatsPage.svelte';
</script>

<AppShell>
  <svelte:fragment slot="header"><Header /></svelte:fragment>
  <svelte:fragment slot="sidebarLeft"><LeftNav /></svelte:fragment>
  <svelte:fragment slot="pageFooter" />

  <div class="relative w-full" style="min-height: calc(100vh - 56px);">
    <Route path="/">
      <MapPage />
    </Route>
    <Route path="/stats">
      <StatsPage />
    </Route>
  </div>
</AppShell>
