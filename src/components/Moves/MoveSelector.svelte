<script>
  import { onMount } from 'svelte';
  import { 
    availableMoves, 
    selectedMove, 
    isLoading, 
    error,
    searchResults,
    hasActiveSearch,
    initializeMovesStore,
    selectMove,
    searchMovesAction,
    clearSearch,
    clearError
  } from '../../stores/movesStore.js';
  import { Button } from '../../shadcn/button/index.js';
  import { Input } from '../../shadcn/input/index.js';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shadcn/card/index.js';
  import { Badge } from '../../shadcn/badge/index.js';
  import { Alert, AlertDescription } from '../../shadcn/alert/index.js';
  import { Skeleton } from '../../shadcn/skeleton/index.js';
  import { TYPE_COLORS } from '../../utils/constants.js';

  // Props usando Svelte 5
  let {
    selectedMoveValue = $bindable(null),
    placeholder = "Buscar movimientos...",
    showDetails = true,
    onMoveSelected = null,
    onMoveCleared = null
  } = $props();

  // Estado local usando Svelte 5
  let searchTerm = $state('');
  let showDropdown = $state(false);
  let searchInput = $state(null);
  let dropdownContainer = $state(null);

  // Reactive statements usando Svelte 5
  let displayMoves = $derived($hasActiveSearch ? $searchResults : $availableMoves);
  let selectedMoveData = $derived($selectedMove);

  // Lifecycle
  onMount(() => {
    console.log('🚀 MoveSelector montado!');
    
    initializeMovesStore().then(() => {
      console.log('📦 MovesStore inicializado');
      // Auto-selecciona si hay un valor inicial
      if (selectedMoveValue && $availableMoves.length > 0) {
        const move = $availableMoves.find(m => m.name === selectedMoveValue || m.id === selectedMoveValue);
        if (move) {
          handleMoveSelect(move);
        }
      }
    });

    // Cierra dropdown cuando se hace clic fuera
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  });

  // Handlers
  async function handleSearch(event) {
    console.log('🔍 handleSearch ejecutado!', event);
    searchTerm = event.target.value;
    console.log('🔍 searchTerm:', searchTerm);
    console.log('🔍 searchTerm.length:', searchTerm.length);
    
    if (searchTerm.length >= 2) {
      console.log('🔍 Buscando movimientos...');
      await searchMovesAction(searchTerm);
      showDropdown = true;
    } else {
      console.log('🔍 Limpiando búsqueda...');
      clearSearch();
      showDropdown = searchTerm.length === 0 && $availableMoves.length > 0;
    }
  }

  async function handleMoveSelect(move) {
    await selectMove(move);
    selectedMoveValue = move.name;
    searchTerm = move.name;
    showDropdown = false;
    
    // Llama callback si existe
    if (onMoveSelected) {
      onMoveSelected({
        move: move,
        moveDetails: $selectedMove
      });
    }
  }

  function handleInputFocus() {
    if ($availableMoves.length > 0 || $searchResults.length > 0) {
      showDropdown = true;
    }
  }

  function handleOutsideClick(event) {
    if (dropdownContainer && !dropdownContainer.contains(event.target)) {
      showDropdown = false;
    }
  }

  function clearSelection() {
    searchTerm = '';
    selectedMoveValue = null;
    clearSearch();
    showDropdown = false;
    
    if (onMoveCleared) {
      onMoveCleared();
    }
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

<div class="move-selector-container" bind:this={dropdownContainer}>
  <!-- Campo de búsqueda -->
  <div class="relative">
    <Input
      type="text"
      bind:ref={searchInput}
      bind:value={searchTerm}
      oninput={handleSearch}
      onfocus={handleInputFocus}
      placeholder={placeholder}
      class="w-full pr-10 text-black"
      disabled={$isLoading}
    />
    
    <!-- Botón de limpiar -->
    {#if searchTerm}
      <Button
        variant="ghost"
        size="sm"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
        onclick={clearSelection}
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </Button>
    {/if}
  </div>

  <!-- Dropdown de resultados -->
  {#if showDropdown}
    <Card class="absolute z-50 w-full mt-1 max-h-80 overflow-y-auto border shadow-lg">
      <CardContent class="p-0">
        {#if $isLoading}
          <!-- Estado de carga -->
          <div class="p-4 space-y-2">
            <Skeleton class="h-4 w-3/4" />
            <Skeleton class="h-4 w-1/2" />
            <Skeleton class="h-4 w-2/3" />
          </div>
        {:else if displayMoves.length === 0}
          <!-- Sin resultados -->
          <div class="p-4 text-center text-gray-500">
            {#if $hasActiveSearch}
              No se encontraron movimientos para "{searchTerm}"
            {:else}
              No hay movimientos disponibles
            {/if}
          </div>
        {:else}
          <!-- Lista de movimientos -->
          <div class="divide-y">
            {#each displayMoves.slice(0, 10) as move (move.id)}
              <button
                class="w-full p-3 text-left hover:bg-gray-50 transition-colors focus:bg-gray-50 focus:outline-none"
                onclick={() => handleMoveSelect(move)}
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-medium text-gray-900">
                        {formatMoveName(move.name)}
                      </span>
                      {#if move.type}
                        <Badge 
                          href="#"
                          style="background-color: {getTypeColor(move.type)}; color: white;"
                          class="text-xs"
                        >
                          {move.type.toUpperCase()}
                        </Badge>
                      {/if}
                    </div>
                    
                    <div class="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      {#if move.power}
                        <span>Poder: {move.power}</span>
                      {/if}
                      {#if move.accuracy}
                        <span>Precisión: {move.accuracy}%</span>
                      {/if}
                      {#if move.pp}
                        <span>PP: {move.pp}</span>
                      {/if}
                    </div>
                  </div>
                  
                  <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            {/each}
            
            {#if displayMoves.length > 10}
              <div class="p-2 text-center text-sm text-gray-500 bg-gray-50">
                Y {displayMoves.length - 10} movimientos más...
              </div>
            {/if}
          </div>
        {/if}
      </CardContent>
    </Card>
  {/if}

  <!-- Mensaje de error -->
  {#if $error}
    <Alert variant="destructive" class="mt-2">
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

  <!-- Información del movimiento seleccionado -->
  {#if showDetails && selectedMoveData}
    <Card class="mt-4">
      <CardHeader class="">
        <CardTitle class="flex items-center gap-2">
          {formatMoveName(selectedMoveData.name)}
          {#if selectedMoveData.type}
            <Badge 
              href="#"
              style="background-color: {getTypeColor(selectedMoveData.type)}; color: white;"
              class=""
            >
              {selectedMoveData.type.toUpperCase()}
            </Badge>
          {/if}
        </CardTitle>
        <CardDescription class="">
          Movimiento Pokemon seleccionado
        </CardDescription>
      </CardHeader>
      
      <CardContent class="">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          {#if selectedMoveData.power}
            <div>
              <div class="text-sm font-medium text-gray-500">Poder</div>
              <div class="text-lg font-semibold">{selectedMoveData.power}</div>
            </div>
          {/if}
          
          {#if selectedMoveData.accuracy}
            <div>
              <div class="text-sm font-medium text-gray-500">Precisión</div>
              <div class="text-lg font-semibold">{selectedMoveData.accuracy}%</div>
            </div>
          {/if}
          
          {#if selectedMoveData.pp}
            <div>
              <div class="text-sm font-medium text-gray-500">PP</div>
              <div class="text-lg font-semibold">{selectedMoveData.pp}</div>
            </div>
          {/if}
          
          <div>
            <div class="text-sm font-medium text-gray-500">Tipo</div>
            <div class="text-lg font-semibold">{selectedMoveData.type || 'Desconocido'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>

 