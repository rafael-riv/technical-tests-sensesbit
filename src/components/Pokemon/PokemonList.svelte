<script>
  import { onMount } from 'svelte';
  import PokemonCard from './PokemonCard.svelte';
  import { Button } from '../../shadcn/button/index.js';
  import { Card, CardContent, CardHeader, CardTitle } from '../../shadcn/card/index.js';
  import { Skeleton } from '../../shadcn/skeleton/index.js';
  import { Alert, AlertDescription } from '../../shadcn/alert/index.js';
  import { 
    pokemonList, 
    isLoading, 
    error, 
    toggleComparisonSelection,
    comparisonSelection,
    canCompare,
    clearError 
  } from '../../stores/pokemonStore.js';

  // Props usando Svelte 5
  let {
    title = "Pokemon que aprenden este movimiento",
    showComparison = true,
    onPokemonSelected = null,
    maxDisplay = 50
  } = $props();

  // Estados locales
  let displayCount = $state(20);

  // Datos reactivos
  let pokemons = $derived($pokemonList);
  let selectedForComparison = $derived($comparisonSelection);
  let canCompareNow = $derived($canCompare);

  // Handlers
  function handlePokemonClick(pokemon) {
    // Solo entrega la URL del Pokemon para búsqueda de stats
    const pokemonUrl = pokemon.url || `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`;
    
    if (onPokemonSelected) {
      onPokemonSelected({
        ...pokemon,
        url: pokemonUrl
      });
    }
    
    console.log('Pokemon URL para stats:', pokemonUrl);
  }

  function handleComparisonToggle(pokemon) {
    if (showComparison) {
      toggleComparisonSelection(pokemon);
    }
  }

  function loadMore() {
    displayCount = Math.min(displayCount + 20, maxDisplay);
  }

  function isSelectedForComparison(pokemon) {
    return selectedForComparison.some(p => p.id === pokemon.id);
  }

  // Computed
  let displayedPokemons = $derived(pokemons.slice(0, displayCount));
  let hasMore = $derived(pokemons.length > displayCount);
</script>

<div class="pokemon-list-container">
  <!-- Header -->
  <Card class="mb-6">
    <CardHeader class="">
      <CardTitle class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🎯</span>
          <div>
            <h2 class="text-xl font-bold text-black">{title}</h2>
            {#if pokemons.length > 0}
              <p class="text-sm text-gray-600 mt-1 text-start">
                {pokemons.length} Pokemon encontrados
              </p>
            {/if}
          </div>
        </div>
        
        {#if showComparison && selectedForComparison.length > 0}
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">
              Seleccionados: {selectedForComparison.length}/2
            </span>
            {#if canCompareNow}
              <Button size="sm" variant="outline" class="">
                Comparar Pokemon
              </Button>
            {/if}
          </div>
        {/if}
      </CardTitle>
    </CardHeader>
  </Card>

  <!-- Mensaje de error -->
  {#if $error}
    <Alert variant="destructive" class="mb-6">
      <AlertDescription class="flex items-center justify-between">
        {$error}
        <Button variant="ghost" size="sm" class="" onclick={clearError}>
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </AlertDescription>
    </Alert>
  {/if}

  <!-- Estados de carga -->
  {#if $isLoading}
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {#each Array(10) as _}
        <Card class="overflow-hidden">
          <div class="aspect-square bg-gray-200">
            <Skeleton class="w-full h-full" />
          </div>
          <CardContent class="p-4">
            <Skeleton class="h-5 w-3/4 mb-2" />
            <Skeleton class="h-4 w-1/2" />
          </CardContent>
        </Card>
      {/each}
    </div>
  {:else if pokemons.length === 0}
    <!-- Estado vacío -->
    <Card class="text-center py-12">
      <CardContent class="">
        <div class="text-6xl mb-4">😔</div>
        <h3 class="text-xl font-semibold mb-2">No se encontraron Pokemon</h3>
        <p class="text-gray-600">
          No hay Pokemon que puedan aprender este movimiento
        </p>
      </CardContent>
    </Card>
  {:else}
    <!-- Lista de Pokemon -->
    <div class="flex flex-wrap gap-4 mb-6 justify-between">
      {#each displayedPokemons as pokemon (pokemon.id)}
        <div class="relative">
          <PokemonCard 
            {pokemon}
            onclick={() => handlePokemonClick(pokemon)}
          />
          
          {#if showComparison && isSelectedForComparison(pokemon)}
            <div class="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {selectedForComparison.findIndex(p => p.id === pokemon.id) + 1}
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Botón cargar más -->
    {#if hasMore}
      <div class="text-center">
        <Button 
          onclick={loadMore}
          variant="outline"
          size="lg"
          class="px-8"
        >
          Cargar más Pokemon ({pokemons.length - displayCount} restantes)
        </Button>
      </div>
    {/if}

    <!-- Indicador de comparación -->
    {#if showComparison && selectedForComparison.length > 0}
      <div class="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-sm">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">⚖️</span>
          <span class="font-semibold">Comparación</span>
        </div>
        
        <div class="space-y-2">
          {#each selectedForComparison as pokemon, index}
            <div class="flex items-center gap-2 text-sm">
              <span class="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                {index + 1}
              </span>
              <span class="capitalize">{pokemon.name}</span>
            </div>
          {/each}
        </div>
        
        {#if canCompareNow}
          <Button class="w-full mt-3" size="sm">
            🔍 Comparar Pokemon
          </Button>
        {:else}
          <p class="text-xs text-gray-500 mt-2">
            Selecciona {2 - selectedForComparison.length} Pokemon más para comparar
          </p>
        {/if}
      </div>
    {/if}
  {/if}
</div>

<style>
  .pokemon-list-container {
    @apply w-full;
  }
</style> 