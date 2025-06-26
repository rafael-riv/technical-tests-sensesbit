<script>
  import { Card, CardContent, CardHeader, CardTitle } from '../../shadcn/card/index.js';
  import { Badge } from '../../shadcn/badge/index.js';
  import { Button } from '../../shadcn/button/index.js';
  import { TYPE_COLORS } from '../../utils/constants.js';
  import { getPokemonStatsAndEvolutions } from '../../services/pokemonApi.js';

  // Props usando Svelte 5
  let {
    pokemon,
    onClose = null
  } = $props();

  // Estados para los stats y evoluciones
  let pokemonData = $state(null);
  let isLoading = $state(true);
  let error = $state(null);

  // Funciones auxiliares
  function getTypeColor(type) {
    return TYPE_COLORS[type] || '#68D391';
  }

  function formatName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');
  }

  // Función para obtener el color de la barra de stat
  function getStatColor(statValue) {
    if (statValue >= 100) return '#10b981'; // Verde para stats altos
    if (statValue >= 70) return '#f59e0b';  // Amarillo para stats medios
    if (statValue >= 40) return '#ef4444';  // Rojo para stats bajos
    return '#6b7280'; // Gris para stats muy bajos
  }

  // Función para formatear nombres de stats
  function formatStatName(statName) {
    const statNames = {
      'hp': 'HP',
      'attack': 'Attack',
      'defense': 'Defense',
      'special-attack': 'Sp. Attack',
      'special-defense': 'Sp. Defense',
      'speed': 'Speed'
    };
    return statNames[statName] || statName;
  }

  // Función para obtener el porcentaje de la barra
  function getStatPercentage(statValue, maxValue = 150) {
    return Math.min((statValue / maxValue) * 100, 100);
  }

  // Cargar datos al montar el componente
  async function loadPokemonData() {
    const pokemonUrl = pokemon.url || `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`;
    
    isLoading = true;
    error = null;
    
    try {
      pokemonData = await getPokemonStatsAndEvolutions(pokemonUrl);
      console.log(`[PokemonDetail] Datos cargados para ${pokemonData.basic.name}:`, pokemonData);
    } catch (err) {
      error = err.message;
      console.error(`[PokemonDetail] Error cargando datos de ${pokemon.name}:`, err);
    } finally {
      isLoading = false;
    }
  }

  // Cargar datos al inicializar
  loadPokemonData();

  // Función para manejar el cierre
  function handleClose() {
    if (onClose) {
      onClose();
    }
  }
</script>

<Card class="w-full flex shadow-xl border-2">
  <CardHeader class="text-center bg-gradient-to-r from-blue-50 to-purple-50">
    <div class="flex items-center justify-between mb-3">
      <Button 
        variant="ghost" 
        size="sm"
        onclick={handleClose}
        class="text-gray-500 hover:text-gray-700"
      >
        ← Volver
      </Button>
      <div class="text-right">
        <span class="text-sm text-gray-500">#{pokemon.id}</span>
      </div>
    </div>

    <!-- Imagen del Pokemon -->
    <div class="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
      {#if pokemon.image}
        <img 
          src={pokemon.image} 
          alt={pokemon.name}
          class="w-full h-full object-contain p-4 rounded-full"
          loading="lazy"
        />
      {:else}
        <div class="text-6xl">❓</div>
      {/if}
    </div>

    <CardTitle class="text-2xl font-bold capitalize mb-2">
      {formatName(pokemon.name)}
    </CardTitle>

    <!-- Tipos -->
    {#if pokemon.types && pokemon.types.length > 0}
      <div class="flex justify-center gap-2 mb-3">
        {#each pokemon.types as type}
          <Badge 
            href="#"
            class="text-sm font-semibold px-3 py-1"
            style="background-color: {getTypeColor(type)}; color: white;"
          >
            {type.toUpperCase()}
          </Badge>
        {/each}
      </div>
    {/if}

    <!-- Info básica -->
    {#if pokemon.height || pokemon.weight}
      <div class="flex justify-center gap-6 text-sm text-gray-600">
        {#if pokemon.height}
          <div class="text-center">
            <div class="font-semibold">Altura</div>
            <div>{(pokemon.height / 10).toFixed(1)}m</div>
          </div>
        {/if}
        {#if pokemon.weight}
          <div class="text-center">
            <div class="font-semibold">Peso</div>
            <div>{(pokemon.weight / 10).toFixed(1)}kg</div>
          </div>
        {/if}
      </div>
    {/if}
  </CardHeader>

  <CardContent class="p-6">
    <!-- Loading state -->
    {#if isLoading}
      <div class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p class="text-gray-500">Cargando información detallada...</p>
      </div>
    {/if}

    <!-- Error state -->
    {#if error && !isLoading}
      <div class="text-center py-8">
        <p class="text-red-500 mb-4">❌ Error al cargar los datos</p>
        <p class="text-sm text-gray-500 mb-4">{error}</p>
        <Button 
          variant="outline" 
          size="sm"
          class=""
          onclick={loadPokemonData}
        >
          🔄 Reintentar
        </Button>
      </div>
    {/if}

    <!-- Contenido principal -->
    {#if pokemonData && !isLoading && !error}
      <!-- Stats de Combate -->
      <div class="mb-6">
        <h3 class="text-lg font-bold mb-4 flex items-center">
          ⚔️ Stats de Combate
          <span class="text-sm text-gray-500 ml-2 font-normal">(Total: {pokemonData.calculated.totalStats})</span>
        </h3>
        
        <div class="space-y-3">
          {#each pokemonData.stats as stat}
            <div class="space-y-1">
              <div class="flex justify-between items-center">
                <span class="font-medium text-sm">{formatStatName(stat.name)}</span>
                <span class="font-bold text-sm" style="color: {getStatColor(stat.baseStat)}">{stat.baseStat}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div 
                  class="h-3 rounded-full transition-all duration-500 ease-out"
                  style="width: {getStatPercentage(stat.baseStat)}%; background-color: {getStatColor(stat.baseStat)}"
                ></div>
              </div>
            </div>
          {/each}
        </div>

        <!-- Stats adicionales -->
        <div class="mt-4 p-3 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="text-center">
              <div class="font-semibold text-gray-600">Stat más alto</div>
              <div class="font-bold" style="color: {getStatColor(Math.max(...pokemonData.stats.map(s => s.baseStat)))}">
                {Math.max(...pokemonData.stats.map(s => s.baseStat))}
              </div>
            </div>
            <div class="text-center">
              <div class="font-semibold text-gray-600">Promedio</div>
              <div class="font-bold text-blue-600">
                {Math.round(pokemonData.calculated.totalStats / pokemonData.stats.length)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Información Física -->
      <div class="mb-6">
        <h3 class="text-lg font-bold mb-4 flex items-center">
          📏 Información Física
        </h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl mb-2">📏</div>
            <div class="font-semibold text-gray-600 text-sm">Altura</div>
            <div class="text-xl font-bold text-blue-600">
              {(pokemonData.basic.height / 10).toFixed(1)}m
            </div>
            <div class="text-xs text-gray-500">
              {pokemonData.basic.height} decímetros
            </div>
          </div>
          
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <div class="text-2xl mb-2">⚖️</div>
            <div class="font-semibold text-gray-600 text-sm">Peso</div>
            <div class="text-xl font-bold text-green-600">
              {(pokemonData.basic.weight / 10).toFixed(1)}kg
            </div>
            <div class="text-xs text-gray-500">
              {pokemonData.basic.weight} hectogramos
            </div>
          </div>
        </div>
      </div>

      <!-- Evoluciones -->
      <div class="mb-4">
        <h3 class="text-lg font-bold mb-4 flex items-center">
          🔄 Cadena Evolutiva
        </h3>
        
        {#if pokemonData.calculated.hasEvolutions}
          <div class="space-y-2">
            {#each pokemonData.evolutions as evolution, index}
              <div class="flex items-center p-3 rounded-lg {evolution.name === pokemon.name ? 'bg-blue-100 border-2 border-blue-300' : 'bg-gray-50'}">
                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-sm font-bold">
                  {index + 1}
                </div>
                <div class="flex-1">
                  <div class="font-semibold capitalize {evolution.name === pokemon.name ? 'text-blue-700' : 'text-gray-700'}">
                    {formatName(evolution.name)}
                  </div>
                  <div class="text-xs text-gray-500">ID: #{evolution.id}</div>
                </div>
                {#if evolution.name === pokemon.name}
                  <Badge href="#" class="bg-blue-500 text-white text-xs">
                    ACTUAL
                  </Badge>
                {/if}
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-6 bg-gray-50 rounded-lg">
            <div class="text-4xl mb-2">🚫</div>
            <p class="text-gray-500">Este Pokemon no tiene evoluciones</p>
          </div>
        {/if}
      </div>

      <!-- Botón de cerrar -->
      <div class="text-center pt-4 border-t">
        <Button 
          variant="outline" 
          onclick={handleClose}
          class="w-full"
        >
          ← Volver a la lista
        </Button>
      </div>
    {/if}
  </CardContent>
</Card> 