/**
 * Store para manejar el estado de los Pokemon
 * Incluye lista de Pokemon, filtros, selección para comparación y navegación
 */

import { writable, derived, get } from 'svelte/store';
import { 
  getPokemonListDetails,
  getFilteredPokemonList,
  getPokemonDetails,
  getPokemonEvolutions,
  searchPokemon,
  comparePokemon
} from '../services/pokemonApi.js';
import { getPokemonByMove as getPokemonByMoveAPI } from '../services/movesApi.js';

/**
 * @typedef {import('../types/pokemon.js').SimplePokemon} SimplePokemon
 * @typedef {import('../types/pokemon.js').Pokemon} Pokemon
 * @typedef {import('../types/pokemon.js').FilteredPokemon} FilteredPokemon
 */

// === ESTADO BASE ===
export const pokemonState = writable({
  // Lista actual de Pokemon (del move seleccionado)
  currentList: [],
  
  // Lista filtrada para mostrar
  filteredList: [],
  
  // Pokemon seleccionado para ver detalles
  selectedPokemon: null,
  
  // Detalles del Pokemon seleccionado
  selectedPokemonDetails: null,
  
  // Pokemon seleccionados para comparación (máximo 2)
  comparisonSelection: [],
  
  // Resultado de comparación
  comparisonResult: null,
  
  // Evoluciones del Pokemon actual
  evolutions: [],
  
  // Move actual del cual vienen los Pokemon
  currentMove: null,
  
  // Estados de carga
  isLoading: false,
  isLoadingDetails: false,
  isLoadingEvolutions: false,
  isComparing: false,
  
  // Manejo de errores
  error: null,
  
  // Resultados de búsqueda
  searchResults: [],
  searchTerm: '',
  isSearching: false,
  
  // Filtros aplicados
  filters: {
    heightMin: null,
    heightMax: null,
    weightMin: null,
    weightMax: null,
    type: null,
    sortBy: 'name', // name, height, weight, moves-count
    sortOrder: 'asc' // asc, desc
  }
});

// === STORES DERIVADOS ===

/**
 * Lista actual de Pokemon para mostrar
 */
export const pokemonList = derived(
  pokemonState,
  $state => $state.filteredList.length > 0 ? $state.filteredList : $state.currentList
);

/**
 * Pokemon seleccionado actualmente
 */
export const selectedPokemon = derived(
  pokemonState,
  $state => $state.selectedPokemon
);

/**
 * Detalles del Pokemon seleccionado
 */
export const selectedPokemonDetails = derived(
  pokemonState,
  $state => $state.selectedPokemonDetails
);

/**
 * Pokemon seleccionados para comparación
 */
export const comparisonSelection = derived(
  pokemonState,
  $state => $state.comparisonSelection
);

/**
 * Si se pueden comparar Pokemon (hay exactamente 2 seleccionados)
 */
export const canCompare = derived(
  pokemonState,
  $state => $state.comparisonSelection.length === 2
);

/**
 * Resultado de la comparación actual
 */
export const comparisonResult = derived(
  pokemonState,
  $state => $state.comparisonResult
);

/**
 * Evoluciones del Pokemon actual
 */
export const evolutions = derived(
  pokemonState,
  $state => $state.evolutions
);

/**
 * Estado de carga general
 */
export const isLoading = derived(
  pokemonState,
  $state => $state.isLoading || $state.isLoadingDetails || $state.isLoadingEvolutions || $state.isComparing || $state.isSearching
);

/**
 * Errores del store
 */
export const error = derived(
  pokemonState,
  $state => $state.error
);

/**
 * Filtros actuales
 */
export const currentFilters = derived(
  pokemonState,
  $state => $state.filters
);

/**
 * Si hay filtros activos
 */
export const hasActiveFilters = derived(
  pokemonState,
  $state => {
    const f = $state.filters;
    return f.heightMin !== null || f.heightMax !== null || 
           f.weightMin !== null || f.weightMax !== null || 
           f.type !== null || f.sortBy !== 'name' || f.sortOrder !== 'asc';
  }
);

// === ACCIONES PRINCIPALES ===

/**
 * Carga la lista de Pokemon que pueden aprender un movimiento específico
 * @param {string} moveName - Nombre del movimiento
 */
export async function loadPokemonByMove(moveName) {
  if (!moveName) {
    console.warn('[PokemonStore] No se proporcionó nombre de movimiento');
    return;
  }

  pokemonState.update(state => ({
    ...state,
    isLoading: true,
    error: null,
    currentMove: moveName,
    currentList: [],
    filteredList: [],
    selectedPokemon: null,
    selectedPokemonDetails: null,
    comparisonSelection: [],
    comparisonResult: null
  }));

  try {
    // Obtiene la lista básica de Pokemon del move
    const pokemonList = await getPokemonByMoveAPI(moveName);
    
    // Obtiene detalles de los Pokemon para mostrar imágenes y tipos
    const pokemonWithDetails = await getPokemonListDetails(pokemonList);
    
    pokemonState.update(state => ({
      ...state,
      currentList: pokemonWithDetails,
      isLoading: false,
      error: null
    }));

    console.log(`[PokemonStore] Cargados ${pokemonWithDetails.length} Pokemon para el move "${moveName}"`);
    
    // Aplica filtros automáticamente
    await applyFilters();
    
  } catch (err) {
    pokemonState.update(state => ({
      ...state,
      isLoading: false,
      error: err.message,
      currentList: [],
      filteredList: []
    }));
    console.error('[PokemonStore] Error al cargar Pokemon por move:', err);
  }
}

/**
 * Selecciona un Pokemon y carga sus detalles
 * @param {SimplePokemon} pokemon - Pokemon a seleccionar
 */
export async function selectPokemon(pokemon) {
  if (!pokemon) {
    console.warn('[PokemonStore] No se proporcionó Pokemon');
    return;
  }

  pokemonState.update(state => ({
    ...state,
    selectedPokemon: pokemon,
    isLoadingDetails: true,
    error: null,
    evolutions: []
  }));

  try {
    const [pokemonDetails, evolutions] = await Promise.all([
      getPokemonDetails(pokemon.name),
      getPokemonEvolutions(pokemon.name).catch(() => []) // No es crítico si falla
    ]);
    
    pokemonState.update(state => ({
      ...state,
      selectedPokemonDetails: pokemonDetails,
      evolutions,
      isLoadingDetails: false,
      error: null
    }));

    console.log(`[PokemonStore] Pokemon seleccionado: ${pokemonDetails.name}`);
    
  } catch (err) {
    pokemonState.update(state => ({
      ...state,
      isLoadingDetails: false,
      error: err.message,
      selectedPokemonDetails: null
    }));
    console.error('[PokemonStore] Error al seleccionar Pokemon:', err);
  }
}

/**
 * Agrega o quita un Pokemon de la selección de comparación
 * @param {SimplePokemon} pokemon - Pokemon a agregar/quitar
 */
export function toggleComparisonSelection(pokemon) {
  pokemonState.update(state => {
    const currentSelection = state.comparisonSelection;
    const index = currentSelection.findIndex(p => p.id === pokemon.id);
    
    let newSelection;
    if (index >= 0) {
      // Quitar de la selección
      newSelection = currentSelection.filter(p => p.id !== pokemon.id);
    } else {
      // Agregar a la selección (máximo 2)
      if (currentSelection.length >= 2) {
        // Reemplaza el primero
        newSelection = [currentSelection[1], pokemon];
      } else {
        newSelection = [...currentSelection, pokemon];
      }
    }
    
    return {
      ...state,
      comparisonSelection: newSelection,
      comparisonResult: null // Limpia resultado anterior
    };
  });
}

/**
 * Compara los Pokemon seleccionados
 */
export async function compareSelectedPokemon() {
  const state = get(pokemonState);
  
  if (state.comparisonSelection.length !== 2) {
    console.warn('[PokemonStore] Se necesitan exactamente 2 Pokemon para comparar');
    return;
  }

  pokemonState.update(state => ({
    ...state,
    isComparing: true,
    error: null
  }));

  try {
    const [pokemon1, pokemon2] = state.comparisonSelection;
    const comparison = await comparePokemon(pokemon1.name, pokemon2.name);
    
    pokemonState.update(state => ({
      ...state,
      comparisonResult: comparison,
      isComparing: false,
      error: null
    }));

    console.log(`[PokemonStore] Comparación completada: ${pokemon1.name} vs ${pokemon2.name}`);
    
  } catch (err) {
    pokemonState.update(state => ({
      ...state,
      isComparing: false,
      error: err.message,
      comparisonResult: null
    }));
    console.error('[PokemonStore] Error al comparar Pokemon:', err);
  }
}

// === FILTROS Y BÚSQUEDA ===

/**
 * Aplica los filtros actuales a la lista de Pokemon
 */
export async function applyFilters() {
  const state = get(pokemonState);
  
  if (state.currentList.length === 0) {
    return;
  }

  try {
    // Obtiene lista con información adicional para filtros
    const pokemonList = state.currentList.map(pokemon => ({
      name: pokemon.name,
      url: `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`
    }));
    
    const filteredPokemon = await getFilteredPokemonList(pokemonList);
    
    // Aplica filtros en el frontend
    let filtered = filteredPokemon.filter(item => {
      const f = state.filters;
      
      // Filtro por altura
      if (f.heightMin !== null && item.heightInMeters < f.heightMin) return false;
      if (f.heightMax !== null && item.heightInMeters > f.heightMax) return false;
      
      // Filtro por peso
      if (f.weightMin !== null && item.weightInKilograms < f.weightMin) return false;
      if (f.weightMax !== null && item.weightInKilograms > f.weightMax) return false;
      
      // Filtro por tipo
      if (f.type && item.primaryType !== f.type) return false;
      
      return true;
    });
    
    // Aplica ordenamiento
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (state.filters.sortBy) {
        case 'height':
          valueA = a.heightInMeters;
          valueB = b.heightInMeters;
          break;
        case 'weight':
          valueA = a.weightInKilograms;
          valueB = b.weightInKilograms;
          break;
        case 'moves-count':
          valueA = a.movesCount;
          valueB = b.movesCount;
          break;
        case 'name':
        default:
          valueA = a.pokemon.name;
          valueB = b.pokemon.name;
          break;
      }
      
      const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      return state.filters.sortOrder === 'desc' ? -comparison : comparison;
    });
    
    // Convierte de vuelta a SimplePokemon
    const simplePokemon = filtered.map(item => ({
      id: item.pokemon.id,
      name: item.pokemon.name,
      url: `https://pokeapi.co/api/v2/pokemon/${item.pokemon.id}`,
      image: state.currentList.find(p => p.id === item.pokemon.id)?.image,
      types: item.pokemon.types?.map(type => type.type.name) || []
    }));
    
    pokemonState.update(state => ({
      ...state,
      filteredList: simplePokemon
    }));
    
  } catch (err) {
    console.error('[PokemonStore] Error al aplicar filtros:', err);
    // En caso de error, muestra la lista original
    pokemonState.update(state => ({
      ...state,
      filteredList: state.currentList
    }));
  }
}

/**
 * Actualiza los filtros
 * @param {Object} newFilters - Nuevos filtros a aplicar
 */
export async function updateFilters(newFilters) {
  pokemonState.update(state => ({
    ...state,
    filters: { ...state.filters, ...newFilters }
  }));
  
  await applyFilters();
}

/**
 * Limpia todos los filtros
 */
export async function clearFilters() {
  pokemonState.update(state => ({
    ...state,
    filters: {
      heightMin: null,
      heightMax: null,
      weightMin: null,
      weightMax: null,
      type: null,
      sortBy: 'name',
      sortOrder: 'asc'
    }
  }));
  
  await applyFilters();
}

/**
 * Busca Pokemon por nombre
 * @param {string} searchTerm - Término de búsqueda
 */
export async function searchPokemonAction(searchTerm) {
  pokemonState.update(state => ({
    ...state,
    searchTerm,
    isSearching: true,
    error: null
  }));

  if (!searchTerm.trim()) {
    pokemonState.update(state => ({
      ...state,
      searchResults: [],
      isSearching: false,
      searchTerm: ''
    }));
    return;
  }

  try {
    const results = await searchPokemon(searchTerm, 20);
    
    pokemonState.update(state => ({
      ...state,
      searchResults: results,
      isSearching: false,
      error: null
    }));

    console.log(`[PokemonStore] Búsqueda "${searchTerm}": ${results.length} resultados`);
  } catch (err) {
    pokemonState.update(state => ({
      ...state,
      searchResults: [],
      isSearching: false,
      error: err.message
    }));
    console.error('[PokemonStore] Error en búsqueda:', err);
  }
}

// === UTILIDADES ===

/**
 * Limpia la selección actual
 */
export function clearSelection() {
  pokemonState.update(state => ({
    ...state,
    selectedPokemon: null,
    selectedPokemonDetails: null,
    evolutions: [],
    error: null
  }));
}

/**
 * Limpia la selección de comparación
 */
export function clearComparisonSelection() {
  pokemonState.update(state => ({
    ...state,
    comparisonSelection: [],
    comparisonResult: null
  }));
}

/**
 * Limpia todos los errores
 */
export function clearError() {
  pokemonState.update(state => ({
    ...state,
    error: null
  }));
}

/**
 * Resetea completamente el store
 */
export function resetPokemonStore() {
  pokemonState.set({
    currentList: [],
    filteredList: [],
    selectedPokemon: null,
    selectedPokemonDetails: null,
    comparisonSelection: [],
    comparisonResult: null,
    evolutions: [],
    currentMove: null,
    isLoading: false,
    isLoadingDetails: false,
    isLoadingEvolutions: false,
    isComparing: false,
    error: null,
    searchResults: [],
    searchTerm: '',
    isSearching: false,
    filters: {
      heightMin: null,
      heightMax: null,
      weightMin: null,
      weightMax: null,
      type: null,
      sortBy: 'name',
      sortOrder: 'asc'
    }
  });
  console.log('[PokemonStore] Store reseteado');
} 