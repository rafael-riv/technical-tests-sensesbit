/**
 * Store para manejar el estado de los movimientos Pokemon
 * Incluye lista de moves, move seleccionado, loading y errores
 */

import { writable, derived, get } from 'svelte/store';
import { getAllMoves, getMoveDetails, getSimpleMovesList, searchMoves } from '../services/movesApi.js';

/**
 * @typedef {import('../types/moves.js').SimpleMove} SimpleMove
 * @typedef {import('../types/moves.js').Move} Move
 */

// === ESTADO BASE ===
export const movesState = writable({
  // Lista completa de moves disponibles
  allMoves: [],
  
  // Lista simplificada para selectores
  simpleMoves: [],
  
  // Move actualmente seleccionado
  selectedMove: null,
  
  // Detalles del move seleccionado
  selectedMoveDetails: null,
  
  // Estados de carga
  isLoading: false,
  isLoadingDetails: false,
  isSearching: false,
  
  // Manejo de errores
  error: null,
  
  // Resultados de búsqueda
  searchResults: [],
  searchTerm: '',
  
  // Configuración
  initialized: false
});

// === STORES DERIVADOS ===

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
  $state => $state.isLoading || $state.isLoadingDetails || $state.isSearching
);

/**
 * Errores del store
 */
export const error = derived(
  movesState,
  $state => $state.error
);

/**
 * Resultados de búsqueda
 */
export const searchResults = derived(
  movesState,
  $state => $state.searchResults
);

/**
 * Si hay una búsqueda activa
 */
export const hasActiveSearch = derived(
  movesState,
  $state => $state.searchTerm.trim().length > 0
);

// === ACCIONES ===

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

/**
 * Busca movimientos por término
 * @param {string} searchTerm - Término de búsqueda
 */
export async function searchMovesAction(searchTerm) {
  movesState.update(state => ({
    ...state,
    searchTerm,
    isSearching: true,
    error: null
  }));

  if (!searchTerm.trim()) {
    movesState.update(state => ({
      ...state,
      searchResults: [],
      isSearching: false,
      searchTerm: ''
    }));
    return;
  }

  try {
    const results = await searchMoves(searchTerm, 20);
    
    movesState.update(state => ({
      ...state,
      searchResults: results,
      isSearching: false,
      error: null
    }));

    console.log(`[MovesStore] Búsqueda "${searchTerm}": ${results.length} resultados`);
  } catch (err) {
    movesState.update(state => ({
      ...state,
      searchResults: [],
      isSearching: false,
      error: err.message
    }));
    console.error('[MovesStore] Error en búsqueda:', err);
  }
}

/**
 * Limpia los resultados de búsqueda
 */
export function clearSearch() {
  movesState.update(state => ({
    ...state,
    searchResults: [],
    searchTerm: '',
    error: null
  }));
}

/**
 * Reintenta la última operación fallida
 */
export async function retryLastOperation() {
  const state = get(movesState);
  
  if (!state.initialized) {
    await initializeMovesStore();
  } else if (state.selectedMove && !state.selectedMoveDetails) {
    await selectMove(state.selectedMove);
  } else if (state.searchTerm) {
    await searchMovesAction(state.searchTerm);
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
    isSearching: false,
    error: null,
    searchResults: [],
    searchTerm: '',
    initialized: false
  });
  console.log('[MovesStore] Store reseteado');
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