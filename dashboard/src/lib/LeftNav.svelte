<script lang="ts">
  import Icon from '@iconify/svelte';
  import { useLocation, link } from 'svelte-navigator';

  const location = useLocation();
</script>

<div class="flex h-full">
  <div
    class="flex flex-col w-64 justify-between p-4 border-r border-surface-300"
  >
    <nav class="list-nav">
      <ul>
        <li class="my-2">
          <a
            href="/"
            class="flex items-center"
            use:link
            class:bg-primary-active-token={$location.pathname === '/'}
          >
            <Icon icon="material-symbols:map" width={24} />
            <span class="flex-auto">Mapa</span>
          </a>
        </li>
        <li class="my-2">
          <a
            href="/stats"
            class="flex items-center"
            use:link
            class:bg-primary-active-token={$location.pathname === '/stats'}
            class:text-black={$location.pathname === '/stats'}
          >
            <Icon icon="material-symbols:query-stats" width={24} />
            <span class="flex-auto">Statystyki</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</div>
