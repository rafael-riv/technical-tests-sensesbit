<script>
  import { Card, CardContent } from '../../shadcn/card/index.js';
  import { Badge } from '../../shadcn/badge/index.js';
  import { TYPE_COLORS } from '../../utils/constants.js';

  // Props usando Svelte 5
  let {
    pokemon,
    onclick = null,
    showComparison = false,
    isSelectedForComparison = false,
    onComparisonToggle = null
  } = $props();

  function getTypeColor(type) {
    return TYPE_COLORS[type] || '#68D391';
  }

  function formatName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');
  }
</script>

<Card 
  class="cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden {isSelectedForComparison ? 'ring-2 ring-blue-500' : ''}"
  onclick={onclick}
>
  <!-- Imagen del Pokemon -->
  <div class="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
    {#if pokemon.image}
      <img 
        src={pokemon.image} 
        alt={pokemon.name}
        class="w-full h-full object-contain p-4"
        loading="lazy"
      />
    {:else}
      <div class="text-4xl">❓</div>
    {/if}
  </div>

  <CardContent class="p-4">
    <!-- Nombre -->
    <h3 class="font-bold text-lg mb-2 capitalize">
      {formatName(pokemon.name)}
    </h3>

    <!-- Tipos -->
    {#if pokemon.types && pokemon.types.length > 0}
      <div class="flex flex-wrap gap-1 mb-2">
        {#each pokemon.types as type}
          <Badge 
            href="#"
            class="text-xs"
            style="background-color: {getTypeColor(type)}; color: white;"
          >
            {type.toUpperCase()}
          </Badge>
        {/each}
      </div>
    {/if}

    <!-- Stats básicas -->
    {#if pokemon.height || pokemon.weight}
      <div class="text-xs text-gray-600 space-y-1">
        {#if pokemon.height}
          <div>Altura: {(pokemon.height / 10).toFixed(1)}m</div>
        {/if}
        {#if pokemon.weight}
          <div>Peso: {(pokemon.weight / 10).toFixed(1)}kg</div>
        {/if}
      </div>
    {/if}
  </CardContent>
</Card>