<script>
  import { onMount } from 'svelte';
  import MoveSelector from '../components/Moves/MoveSelector.svelte';
  import PokemonListPage from './PokemonListPage.svelte';
  import { Button } from '../shadcn/button/index.js';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shadcn/card/index.js';
  import { Badge } from '../shadcn/badge/index.js';
  import { Skeleton } from '../shadcn/skeleton/index.js';
  import { Alert, AlertDescription } from '../shadcn/alert/index.js';
  import { selectedMove, isLoading, error } from '../stores/movesStore.js';
  import { TYPE_COLORS } from '../utils/constants.js';

  // Estado local usando Svelte 5
  let selectedMoveData = $state(null);
  let currentPage = $state('home'); // 'home' | 'pokemon-list'
  let pokemonError = $state(null);

  // Reactive statements usando Svelte 5
  let moveDetails = $derived($selectedMove);
  let hasSelectedMove = $derived(!!selectedMoveData);

  onMount(() => {
    console.log('🏠 HomePage montada');
  });

  // Handlers
  async function handleMoveSelected(event) {
    console.log('🎯 Movimiento seleccionado:', event);
    selectedMoveData = event.move;
    pokemonError = null;
    currentPage = 'home'; // Asegurar que estamos en home al seleccionar nuevo movimiento
  }

  function handleMoveCleared() {
    console.log('🧹 Movimiento limpiado');
    selectedMoveData = null;
    pokemonError = null;
    currentPage = 'home';
  }

  function handleViewPokemon() {
    if (!selectedMoveData) return;

    console.log('🔍 Navegando a lista de Pokemon para:', selectedMoveData.name);
    currentPage = 'pokemon-list';
  }

  function handleNavigateBack() {
    console.log('🔙 Volviendo a HomePage');
    currentPage = 'home';
    pokemonError = null;
  }

  function getTypeColor(type) {
    return TYPE_COLORS[type] || '#68D391';
  }

  function formatMoveName(name) {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
</script>

{#if currentPage === 'home'}
  <!-- HomePage: Selección de movimiento -->
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <!-- Hero Section -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div class="container mx-auto px-4 py-16">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold mb-4">
            🔍 Pokédex de Movimientos
          </h1>
          <p class="text-xl md:text-2xl mb-8 text-blue-100">
            Descubre qué Pokemon pueden aprender cada movimiento
          </p>
          <div class="max-w-2xl mx-auto">
            <MoveSelector 
              placeholder="Busca un movimiento Pokemon..."
              showDetails={false}
              onMoveSelected={handleMoveSelected}
              onMoveCleared={handleMoveCleared}
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 py-8">
      {#if $error}
        <Alert variant="destructive" class="mb-6">
          <AlertDescription class="">
            {$error}
          </AlertDescription>
        </Alert>
      {/if}

      {#if pokemonError}
        <Alert variant="destructive" class="mb-6">
          <AlertDescription class="">
            {pokemonError}
          </AlertDescription>
        </Alert>
      {/if}

      {#if $isLoading}
        <!-- Estado de carga -->
        <Card class="mb-6">
          <CardHeader class="">
            <Skeleton class="h-8 w-64" />
            <Skeleton class="h-4 w-48" />
          </CardHeader>
          <CardContent class="">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              {#each Array(4) as _}
                <div>
                  <Skeleton class="h-4 w-16 mb-2" />
                  <Skeleton class="h-6 w-12" />
                </div>
              {/each}
            </div>
          </CardContent>
        </Card>
      {:else if hasSelectedMove && moveDetails}
        <!-- Información detallada del movimiento -->
        <Card class="mb-6">
          <CardHeader class="">
            <CardTitle class="flex items-center gap-3">
              <span class="text-2xl">⚡</span>
              <div class="flex items-center gap-3">
                <h2 class="text-2xl font-bold text-black">
                  {formatMoveName(moveDetails.name)}
                </h2>
                {#if moveDetails.type}
                  <Badge 
                    href="#"
                    style="background-color: {getTypeColor(moveDetails.type)}; color: white;"
                    class=""
                  >
                    {moveDetails.type.toUpperCase()}
                  </Badge>
                {/if}
              </div>
            </CardTitle>
            <CardDescription class="text-lg text-black text-left">
              Información detallada del movimiento seleccionado
            </CardDescription>
          </CardHeader>
          
          <CardContent class="">
            <!-- Stats del movimiento -->
            <div class="grid grid-cols-3 gap-6 mb-6">
              {#if moveDetails.power}
                <div class="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div class="text-sm font-medium text-red-600 mb-1">Poder</div>
                  <div class="text-2xl font-bold text-red-700">{moveDetails.power}</div>
                </div>
              {/if}
              
              {#if moveDetails.accuracy}
                <div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div class="text-sm font-medium text-blue-600 mb-1">Precisión</div>
                  <div class="text-2xl font-bold text-blue-700">{moveDetails.accuracy}%</div>
                </div>
              {/if}
              
              {#if moveDetails.pp}
                <div class="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div class="text-sm font-medium text-green-600 mb-1">PP</div>
                  <div class="text-2xl font-bold text-green-700">{moveDetails.pp}</div>
                </div>
              {/if}
              
              {#if moveDetails.damage_class}
                <div class="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div class="text-sm font-medium text-purple-600 mb-1">Clase</div>
                  <div class="text-lg font-bold text-purple-700 capitalize">
                    {moveDetails.damage_class.name}
                  </div>
                </div>
              {/if}
            </div>

            <!-- Descripción del movimiento -->
            {#if moveDetails.flavor_text_entries && moveDetails.flavor_text_entries.length > 0}
              <div class="mb-6">
                <h3 class="text-lg font-semibold mb-3">Descripción</h3>
                <div class="bg-gray-50 p-4 rounded-lg border">
                  <p class="text-gray-700 leading-relaxed">
                    {moveDetails.flavor_text_entries.find(entry => entry.language.name === 'es')?.flavor_text || 
                     moveDetails.flavor_text_entries.find(entry => entry.language.name === 'en')?.flavor_text || 
                     'Descripción no disponible'}
                  </p>
                </div>
              </div>
            {/if}

            <!-- Botón para ver Pokemon -->
            <div class="text-center">
              <Button 
                size="lg" 
                onclick={handleViewPokemon}
                class="px-8 py-3 text-lg"
              >
                🔍 Ver Pokemon que aprenden este movimiento
              </Button>
            </div>
          </CardContent>
        </Card>
      {:else}
        <!-- Estado inicial -->
        <Card class="text-center py-12">
          <CardContent class="">
            <div class="text-6xl mb-4">🎯</div>
            <h3 class="text-xl font-semibold mb-2 text-teal-600">Selecciona un movimiento</h3>
            <p class="text-gray-600 mb-6">
              Usa el buscador de arriba para encontrar un movimiento Pokemon
            </p>
            <div class="max-w-md mx-auto text-left">
              <h4 class="font-semibold mb-3 text-blue-500">¿Cómo usar esta herramienta?</h4>
              <ol class="list-decimal list-inside space-y-2 text-sm text-gray-600">
                <li>Escribe el nombre de un movimiento en el buscador</li>
                <li>Selecciona el movimiento de la lista</li>
                <li>Ve la información detallada del movimiento</li>
                <li>Haz clic en "Ver Pokemon" para ver qué Pokemon pueden aprenderlo</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      {/if}
    </div>
  </div>

{:else if currentPage === 'pokemon-list' && selectedMoveData}
  <!-- PokemonListPage: Lista de Pokemon -->
  <PokemonListPage 
    moveName={selectedMoveData.name}
    onNavigateBack={handleNavigateBack}
  />
{/if}

<style>
  :global(html) {
    scroll-behavior: smooth;
  }
</style> 