<script>
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import PokemonList from '../components/Pokemon/PokemonList.svelte';
  import { Button } from '../shadcn/button/index.js';
  import { Card, CardContent, CardHeader, CardTitle } from '../shadcn/card/index.js';
  import { Badge } from '../shadcn/badge/index.js';
  import { Alert, AlertDescription } from '../shadcn/alert/index.js';
  import { 
    pokemonList, 
    isLoading as isPokemonLoading, 
    error as pokemonError,
    loadPokemonByMove,
    clearError as clearPokemonError
  } from '../stores/pokemonStore.js';
  import { selectedMove } from '../stores/movesStore.js';
  import { TYPE_COLORS } from '../utils/constants.js';

  // Props para recibir datos de navegación
  let {
    moveName = null,
    onNavigateBack = null
  } = $props();

  // Estados locales
  let isLoading = $state(false);
  let error = $state(null);
  let currentMoveName = $state(moveName);

  // Datos reactivos
  let pokemons = $derived($pokemonList);
  let moveDetails = $derived($selectedMove);

  onMount(async () => {
    console.log('📋 PokemonListPage montada para movimiento:', currentMoveName);
    
    // Si tenemos un movimiento, cargar los Pokemon
    if (currentMoveName) {
      await loadPokemonForMove(currentMoveName);
    } else {
      error = 'No se especificó un movimiento para mostrar Pokemon';
    }
  });

  async function loadPokemonForMove(move) {
    if (!move) return;

    isLoading = true;
    error = null;

    try {
      console.log('🔍 Cargando Pokemon para el movimiento:', move);
      await loadPokemonByMove(move);
      console.log('✅ Pokemon cargados exitosamente');
    } catch (err) {
      console.error('❌ Error al cargar Pokemon:', err);
      error = err.message || 'Error al cargar los Pokemon';
    } finally {
      isLoading = false;
    }
  }

  function handleNavigateBack() {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      // Fallback: recargar la página home
      window.location.href = '/';
    }
  }

  function handlePokemonSelected(pokemon) {
    console.log('🎯 Pokemon seleccionado en lista:', pokemon);
    // Aquí se podría navegar a la página de detalles del Pokemon
    // onNavigateToPokemonDetail?.(pokemon);
  }

  function getTypeColor(type) {
    return TYPE_COLORS[type] || '#68D391';
  }

  function formatMoveName(name) {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  function clearError() {
    error = null;
    clearPokemonError();
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
  <!-- Header con navegación -->
  <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
    <div class="container mx-auto px-4 py-8">
      <div class="flex items-center gap-4 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          class="text-white hover:text-blue-200 hover:bg-blue-700/50"
          onclick={handleNavigateBack}
        >
          <span class="mr-2">←</span>
          Volver al inicio
        </Button>
      </div>
      
      <div class="text-center">
        <h1 class="text-3xl md:text-4xl font-bold mb-2">
          🎯 Pokemon que aprenden
        </h1>
        {#if currentMoveName}
          <div class="flex items-center justify-center gap-3 mb-4">
            <h2 class="text-2xl md:text-3xl font-bold text-blue-100">
              {formatMoveName(currentMoveName)}
            </h2>
            {#if moveDetails?.type}
              <Badge 
                href="#"
                style="background-color: {getTypeColor(moveDetails.type)}; color: white;"
                class="text-lg px-3 py-1"
              >
                {moveDetails.type.toUpperCase()}
              </Badge>
            {/if}
          </div>
        {/if}
        <p class="text-lg text-blue-100">
          Explora todos los Pokemon que pueden aprender este movimiento
        </p>
      </div>
    </div>
  </div>

  <!-- Contenido principal -->
  <div class="container mx-auto px-4 py-8">
    <!-- Mensaje de error -->
    {#if error || $pokemonError}
      <Alert variant="destructive" class="mb-6">
        <AlertDescription class="flex items-center justify-between">
          {error || $pokemonError}
          <Button variant="ghost" size="sm" class="" onclick={clearError}>
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </AlertDescription>
      </Alert>
    {/if}

    <!-- Información del movimiento -->
    {#if moveDetails && !isLoading && !$isPokemonLoading}
      <Card class="mb-6">
        <CardHeader class="">
          <CardTitle class="flex items-center gap-3">
            <span class="text-2xl">⚡</span>
            <div>
              <h3 class="text-xl font-bold">Información del Movimiento</h3>
              <p class="text-sm text-gray-600 mt-1">
                Detalles sobre {formatMoveName(currentMoveName)}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent class="">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            {#if moveDetails.power}
              <div class="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div class="text-sm font-medium text-red-600 mb-1">Poder</div>
                <div class="text-xl font-bold text-red-700">{moveDetails.power}</div>
              </div>
            {/if}
            
            {#if moveDetails.accuracy}
              <div class="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div class="text-sm font-medium text-blue-600 mb-1">Precisión</div>
                <div class="text-xl font-bold text-blue-700">{moveDetails.accuracy}%</div>
              </div>
            {/if}
            
            {#if moveDetails.pp}
              <div class="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div class="text-sm font-medium text-green-600 mb-1">PP</div>
                <div class="text-xl font-bold text-green-700">{moveDetails.pp}</div>
              </div>
            {/if}
            
            {#if moveDetails.damage_class}
              <div class="text-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div class="text-sm font-medium text-purple-600 mb-1">Clase</div>
                <div class="text-lg font-bold text-purple-700 capitalize">
                  {moveDetails.damage_class.name}
                </div>
              </div>
            {/if}
          </div>
        </CardContent>
      </Card>
    {/if}

    <!-- Lista de Pokemon -->
    {#if isLoading || $isPokemonLoading}
      <!-- Estado de carga -->
      <Card class="text-center py-12">
        <CardContent class="">
          <div class="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 class="text-xl font-semibold mb-2">Cargando Pokemon...</h3>
          <p class="text-gray-600">
            Obteniendo la lista de Pokemon que pueden aprender {currentMoveName ? formatMoveName(currentMoveName) : 'este movimiento'}
          </p>
        </CardContent>
      </Card>
    {:else if pokemons.length > 0}
      <!-- Lista de Pokemon -->
      <PokemonList 
        title="Lista completa de Pokemon"
        showComparison={true}
        onPokemonSelected={handlePokemonSelected}
        maxDisplay={200}
      />
    {:else if currentMoveName}
      <!-- Estado vacío -->
      <Card class="text-center py-12">
        <CardContent class="">
          <div class="text-6xl mb-4">😔</div>
          <h3 class="text-xl font-semibold mb-2">No se encontraron Pokemon</h3>
          <p class="text-gray-600 mb-4">
            No hay Pokemon que puedan aprender el movimiento "{formatMoveName(currentMoveName)}"
          </p>
          <Button onclick={handleNavigateBack} variant="outline" class="">
            Volver e intentar con otro movimiento
          </Button>
        </CardContent>
      </Card>
    {:else}
      <!-- Error: no hay movimiento -->
      <Card class="text-center py-12">
        <CardContent class="">
          <div class="text-6xl mb-4">⚠️</div>
          <h3 class="text-xl font-semibold mb-2">Movimiento no especificado</h3>
          <p class="text-gray-600 mb-4">
            No se pudo determinar qué movimiento mostrar
          </p>
          <Button onclick={handleNavigateBack} class="">
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    {/if}
  </div>
</div>

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style> 