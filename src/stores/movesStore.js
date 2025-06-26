/**
 * Store para manejar el estado de los movimientos Pokemon
 * SEPARACIÓN COMPLETA: Input State vs Dropdown List State
 */

import { writable, derived, get } from 'svelte/store';
import { getAllMoves, getMoveDetails, getSimpleMovesList, searchMoves } from '../services/movesApi.js';

/**
 * @typedef {import('../types/moves.js').SimpleMove} SimpleMove
 * @typedef {import('../types/moves.js').Move} Move
 */

// === ESTADO BASE PRINCIPAL ===
export const movesState = writable({
  // Lista completa de moves disponibles
  allMoves: [],
  
  // Lista simplificada para selectores
  simpleMoves: [],
  
  // Move actualmente seleccionado
  selectedMove: null,
  
  // Detalles del move seleccionado
  selectedMoveDetails: null,
  
  // Estados de carga principales
  isLoading: false,
  isLoadingDetails: false,
  
  // Manejo de errores
  error: null,
  
  // Configuración
  initialized: false
});

// === ESTADO SEPARADO PARA DROPDOWN (Solo reactividad de lista) ===
export const dropdownState = writable({
  // Resultados actuales para mostrar en dropdown
  displayMoves: [],
  
  // Estado de búsqueda activa
  isSearching: false,
  
  // Término de búsqueda actual (solo para UI de dropdown)
  currentSearchTerm: '',
  
  // Si hay una búsqueda activa
  hasActiveSearch: false,
  
  // Errores específicos de búsqueda
  searchError: null
});

// === STORES DERIVADOS PRINCIPALES ===

/**
 * Lista de moves disponibles para mostrar en selectores
 */
export const availableMoves = derived(
  movesState,
  $state => $state.simpleMoves
);

/**
 * Move actualmente seleccionado
 */
export const selectedMove = derived(
  movesState,
  $state => $state.selectedMove
);

/**
 * Detalles del move seleccionado
 */
export const selectedMoveDetails = derived(
  movesState,
  $state => $state.selectedMoveDetails
);

/**
 * Estado de carga general
 */
export const isLoading = derived(
  movesState,
  $state => $state.isLoading || $state.isLoadingDetails
);

/**
 * Errores del store principal
 */
export const error = derived(
  movesState,
  $state => $state.error
);

// === STORES DERIVADOS PARA DROPDOWN (Solo para lista desplegable) ===

/**
 * Moves a mostrar en el dropdown (reactivo)
 */
export const displayMoves = derived(
  dropdownState,
  $dropdown => $dropdown.displayMoves
);

/**
 * Estado de búsqueda (reactivo para loading en dropdown)
 */
export const isSearching = derived(
  dropdownState,
  $dropdown => $dropdown.isSearching
);

/**
 * Si hay una búsqueda activa (reactivo para UI)
 */
export const hasActiveSearch = derived(
  dropdownState,
  $dropdown => $dropdown.hasActiveSearch
);

/**
 * Término actual de búsqueda (reactivo para mostrar en UI)
 */
export const currentSearchTerm = derived(
  dropdownState,
  $dropdown => $dropdown.currentSearchTerm
);

/**
 * Errores de búsqueda (reactivo para mostrar en UI)
 */
export const searchError = derived(
  dropdownState,
  $dropdown => $dropdown.searchError
);

// === COMPATIBILIDAD (deprecated) ===
export const searchResults = displayMoves; // Alias para compatibilidad

// === ACCIONES PRINCIPALES ===

/**
 * Inicializa el store cargando la lista de moves
 */
export async function initializeMovesStore() {
  const state = get(movesState);
  
  if (state.initialized) {
    return; // Ya está inicializado
  }

  movesState.update(state => ({
    ...state,
    isLoading: true,
    error: null
  }));

  try {
    const simpleMoves = await getSimpleMovesList(100);
    
    movesState.update(state => ({
      ...state,
      simpleMoves,
      isLoading: false,
      initialized: true,
      error: null
    }));

    // Inicializar dropdown con la lista completa
    dropdownState.update(dropdown => ({
      ...dropdown,
      displayMoves: simpleMoves,
      hasActiveSearch: false,
      currentSearchTerm: ''
    }));

    console.log(`[MovesStore] Inicializado con ${simpleMoves.length} movimientos`);
  } catch (err) {
    movesState.update(state => ({
      ...state,
      isLoading: false,
      error: err.message,
      initialized: false
    }));
    console.error('[MovesStore] Error al inicializar:', err);
  }
}

/**
 * Selecciona un movimiento y carga sus detalles
 * @param {SimpleMove|string} move - Move a seleccionar o su nombre
 */
export async function selectMove(move) {
  const moveId = typeof move === 'string' ? move : move.name;
  
  movesState.update(state => ({
    ...state,
    selectedMove: typeof move === 'string' ? null : move,
    isLoadingDetails: true,
    error: null
  }));

  try {
    const moveDetails = await getMoveDetails(moveId);
    
    movesState.update(state => ({
      ...state,
      selectedMoveDetails: moveDetails,
      selectedMove: typeof move === 'string' 
        ? state.simpleMoves.find(m => m.name === moveId) || { name: moveId, id: moveDetails.id }
        : move,
      isLoadingDetails: false,
      error: null
    }));

    console.log(`[MovesStore] Move seleccionado: ${moveDetails.name}`);
  } catch (err) {
    movesState.update(state => ({
      ...state,
      isLoadingDetails: false,
      error: err.message,
      selectedMoveDetails: null
    }));
    console.error('[MovesStore] Error al seleccionar move:', err);
  }
}

/**
 * Limpia la selección actual
 */
export function clearSelection() {
  movesState.update(state => ({
    ...state,
    selectedMove: null,
    selectedMoveDetails: null,
    error: null
  }));
  console.log('[MovesStore] Selección limpiada');
}

// === ACCIONES PARA DROPDOWN (Solo actualizan la lista desplegable) ===

/**
 * Busca movimientos y actualiza SOLO el dropdown
 * @param {string} searchTerm - Término de búsqueda (viene del input)
 */
export async function searchMovesForDropdown(searchTerm) {
  console.log(`[DropdownState] Búsqueda para: "${searchTerm}"`);
  
  dropdownState.update(dropdown => ({
    ...dropdown,
    isSearching: true,
    searchError: null,
    currentSearchTerm: searchTerm
  }));

  if (!searchTerm.trim()) {
    // Mostrar lista completa si no hay término
    const mainState = get(movesState);
    dropdownState.update(dropdown => ({
      ...dropdown,
      displayMoves: mainState.simpleMoves,
      isSearching: false,
      hasActiveSearch: false,
      currentSearchTerm: '',
      searchError: null
    }));
    return;
  }

  try {
    const results = await searchMoves(searchTerm, 20);
    
    dropdownState.update(dropdown => ({
      ...dropdown,
      displayMoves: results,
      isSearching: false,
      hasActiveSearch: true,
      searchError: null
    }));

    console.log(`[DropdownState] Búsqueda "${searchTerm}": ${results.length} resultados`);
  } catch (err) {
    dropdownState.update(dropdown => ({
      ...dropdown,
      displayMoves: [],
      isSearching: false,
      searchError: err.message
    }));
    console.error('[DropdownState] Error en búsqueda:', err);
  }
}

/**
 * Limpia la búsqueda del dropdown (vuelve a lista completa)
 */
export function clearDropdownSearch() {
  const mainState = get(movesState);
  dropdownState.update(dropdown => ({
    ...dropdown,
    displayMoves: mainState.simpleMoves,
    hasActiveSearch: false,
    currentSearchTerm: '',
    searchError: null
  }));
  console.log('[DropdownState] Búsqueda limpiada');
}

// === ACCIONES DE COMPATIBILIDAD (deprecated pero funcionales) ===

/**
 * @deprecated Usar searchMovesForDropdown en su lugar
 */
export async function searchMovesAction(searchTerm) {
  return await searchMovesForDropdown(searchTerm);
}

/**
 * @deprecated Usar clearDropdownSearch en su lugar
 */
export function clearSearch() {
  return clearDropdownSearch();
}

/**
 * Reintenta la última operación fallida
 */
export async function retryLastOperation() {
  const state = get(movesState);
  const dropdown = get(dropdownState);
  
  if (!state.initialized) {
    await initializeMovesStore();
  } else if (state.selectedMove && !state.selectedMoveDetails) {
    await selectMove(state.selectedMove);
  } else if (dropdown.currentSearchTerm) {
    await searchMovesForDropdown(dropdown.currentSearchTerm);
  }
}

/**
 * Limpia todos los errores
 */
export function clearError() {
  movesState.update(state => ({
    ...state,
    error: null
  }));
  dropdownState.update(dropdown => ({
    ...dropdown,
    searchError: null
  }));
}

/**
 * Resetea completamente el store
 */
export function resetMovesStore() {
  movesState.set({
    allMoves: [],
    simpleMoves: [],
    selectedMove: null,
    selectedMoveDetails: null,
    isLoading: false,
    isLoadingDetails: false,
    error: null,
    initialized: false
  });
  
  dropdownState.set({
    displayMoves: [],
    isSearching: false,
    currentSearchTerm: '',
    hasActiveSearch: false,
    searchError: null
  });
  
  console.log('[MovesStore] Store reseteado completamente');
}

// === UTILIDADES ===

/**
 * Obtiene un move por su nombre
 * @param {string} moveName - Nombre del move
 * @returns {SimpleMove|null} Move encontrado o null
 */
export function getMoveByName(moveName) {
  const state = get(movesState);
  return state.simpleMoves.find(move => move.name === moveName) || null;
}

/**
 * Verifica si un move está disponible
 * @param {string} moveName - Nombre del move
 * @returns {boolean} Si el move está disponible
 */
export function isMoveAvailable(moveName) {
  return getMoveByName(moveName) !== null;
} 