<script lang="ts">
  import Icon from '@iconify/svelte';
  import { AppBar } from '@skeletonlabs/skeleton';
</script>

<AppBar>
  <svelte:fragment slot="lead"><div /></svelte:fragment>

  <div class="tracking-wider">Gwizd Panel</div>
  <svelte:fragment slot="trail">
    <Icon icon="codicon:account" width={30} />
  </svelte:fragment>
</AppBar>
