/**
 * Servicio para interactuar con los endpoints de Moves de la PokeAPI
 * Proporciona funciones para obtener información de movimientos
 */

import { apiClient } from './apiClient.js';
import { API_CONFIG, PAGINATION } from '../utils/constants.js';

/**
 * @typedef {import('../types/moves.js').Move} Move
 * @typedef {import('../types/moves.js').SimpleMove} SimpleMove
 * @typedef {import('../types/moves.js').MoveListResponse} MoveListResponse
 * @typedef {import('../types/moves.js').MovePokemonByType} MovePokemonByType
 */

/**
 * Obtiene la lista completa de movimientos disponibles
 * @param {Object} [options] - Opciones de paginación
 * @param {number} [options.limit] - Límite de resultados (default: 50)
 * @param {number} [options.offset] - Desplazamiento para paginación (default: 0)
 * @returns {Promise<MoveListResponse>} Lista de movimientos
 */
export async function getAllMoves(options = {}) {
  const {
    limit = PAGINATION.MOVES_LIMIT,
    offset = 0
  } = options;

  try {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.MOVES, {
      limit,
      offset
    });

    return response;
  } catch (error) {
    console.error('Error al obtener lista de movimientos:', error);
    throw new Error('No se pudieron cargar los movimientos disponibles');
  }
}

/**
 * Obtiene información detallada de un movimiento específico
 * @param {string|number} moveIdOrName - ID o nombre del movimiento
 * @returns {Promise<Move>} Información completa del movimiento
 */
export async function getMoveDetails(moveIdOrName) {
  if (!moveIdOrName) {
    throw new Error('ID o nombre del movimiento es requerido');
  }

  try {
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.MOVES}/${moveIdOrName}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener detalles del movimiento ${moveIdOrName}:`, error);
    throw new Error(`No se pudieron obtener los detalles del movimiento "${moveIdOrName}"`);
  }
}

/**
 * Obtiene una lista simplificada de movimientos para selectores
 * @param {number} limit - Número máximo de movimientos a obtener
 * @returns {Promise<SimpleMove[]>} Lista simplificada de movimientos
 */
export async function getSimpleMovesList(limit = 100) {
  try {
    const response = await getAllMoves({ limit });
    
    // Obtiene detalles básicos en paralelo para los primeros movimientos
    const moveRequests = response.results.slice(0, Math.min(50, limit)).map(move => ({
      endpoint: `${API_CONFIG.ENDPOINTS.MOVES}/${move.name}`,
      params: {},
      options: { useCache: true }
    }));

    const moveDetails = await apiClient.getMany(moveRequests);
    
    const simpleMoves = moveDetails
      .filter(result => !result.error)
      .map(move => ({
        id: move.id,
        name: move.name,
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MOVES}/${move.id}`,
        type: move.type?.name || 'unknown',
        power: move.power,
        accuracy: move.accuracy,
        pp: move.pp
      }));

    return simpleMoves;
  } catch (error) {
    console.error('Error al obtener lista simplificada de movimientos:', error);
    throw new Error('No se pudo cargar la lista de movimientos');
  }
}

/**
 * Obtiene todos los Pokemon que pueden aprender un movimiento específico
 * @param {string|number} moveIdOrName - ID o nombre del movimiento
 * @returns {Promise<Array<{name: string, url: string}>>} Lista de Pokemon
 */
export async function getPokemonByMove(moveIdOrName) {
  try {
    const moveDetails = await getMoveDetails(moveIdOrName);
    
    if (!moveDetails.learned_by_pokemon || moveDetails.learned_by_pokemon.length === 0) {
      console.log(`[getPokemonByMove] No hay Pokemon que aprendan el movimiento: ${moveIdOrName}`);
      return [];
    }

    // Filtrar entradas válidas - la estructura correcta es {name, url} directamente
    const validEntries = moveDetails.learned_by_pokemon.filter((entry, index) => {
      // Validación robusta de la estructura de datos correcta
      if (!entry || !entry.name || !entry.url) {
        console.warn(`[getPokemonByMove] Entrada inválida en índice ${index} para ${moveIdOrName}:`, entry);
        return false;
      }
      return true;
    });

    if (validEntries.length !== moveDetails.learned_by_pokemon.length) {
      console.warn(`[getPokemonByMove] ${moveDetails.learned_by_pokemon.length - validEntries.length} entradas inválidas filtradas para ${moveIdOrName}`);
    }

    console.log(`[getPokemonByMove] ${validEntries.length} Pokemon válidos encontrados para: ${moveIdOrName}`);

    // Mapear directamente ya que la estructura es {name, url}
    return validEntries.map(entry => ({
      name: entry.name,
      url: entry.url
    }));
  } catch (error) {
    console.error(`Error al obtener Pokemon del movimiento ${moveIdOrName}:`, error);
    throw new Error(`No se pudieron obtener los Pokemon que aprenden "${moveIdOrName}"`);
  }
}

/**
 * Obtiene Pokemon agrupados por tipo para un movimiento específico
 * @param {string|number} moveIdOrName - ID o nombre del movimiento
 * @returns {Promise<MovePokemonByType[]>} Pokemon agrupados por tipo
 */
export async function getPokemonByMoveGroupedByType(moveIdOrName) {
  try {
    const pokemonList = await getPokemonByMove(moveIdOrName);
    
    if (pokemonList.length === 0) {
      return [];
    }

    // Obtiene detalles de los Pokemon para conocer sus tipos
    const pokemonRequests = pokemonList.slice(0, 50).map(pokemon => ({
      endpoint: pokemon.url.replace(API_CONFIG.BASE_URL, ''),
      params: {},
      options: { useCache: true }
    }));

    const pokemonDetails = await apiClient.getMany(pokemonRequests);
    
    // Agrupa por tipo principal
    const typeGroups = {};
    
    pokemonDetails
      .filter(result => !result.error)
      .forEach(pokemon => {
        const primaryType = pokemon.types?.[0]?.type?.name || 'unknown';
        
        if (!typeGroups[primaryType]) {
          typeGroups[primaryType] = {
            type: primaryType,
            count: 0,
            pokemonNames: []
          };
        }
        
        typeGroups[primaryType].count++;
        typeGroups[primaryType].pokemonNames.push(pokemon.name);
      });

    // Convierte a array y ordena por cantidad
    return Object.values(typeGroups)
      .sort((a, b) => b.count - a.count);
      
  } catch (error) {
    console.error(`Error al agrupar Pokemon por tipo para el movimiento ${moveIdOrName}:`, error);
    throw new Error(`No se pudieron agrupar los Pokemon por tipo para "${moveIdOrName}"`);
  }
}

/**
 * Busca movimientos por nombre (búsqueda parcial)
 * @param {string} searchTerm - Término de búsqueda
 * @param {number} limit - Límite de resultados
 * @returns {Promise<SimpleMove[]>} Movimientos que coinciden con la búsqueda
 */
export async function searchMoves(searchTerm, limit = 20) {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }

  try {
    const allMoves = await getAllMoves({ limit: 100 });
    
    // Filtra movimientos que coincidan con el término de búsqueda
    const matchingMoves = allMoves.results.filter(move =>
      move.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, limit);

    // Obtiene detalles de los movimientos coincidentes
    const moveRequests = matchingMoves.map(move => ({
      endpoint: `${API_CONFIG.ENDPOINTS.MOVES}/${move.name}`,
      params: {},
      options: { useCache: true }
    }));

    const moveDetails = await apiClient.getMany(moveRequests);
    
    return moveDetails
      .filter(result => !result.error)
      .map(move => ({
        id: move.id,
        name: move.name,
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MOVES}/${move.id}`,
        type: move.type?.name || 'unknown',
        power: move.power,
        accuracy: move.accuracy,
        pp: move.pp
      }));
      
  } catch (error) {
    console.error('Error al buscar movimientos:', error);
    throw new Error('No se pudo realizar la búsqueda de movimientos');
  }
}

/**
 * Obtiene movimientos filtrados por tipo
 * @param {string} type - Tipo de movimiento (fire, water, etc.)
 * @param {number} limit - Límite de resultados
 * @returns {Promise<SimpleMove[]>} Movimientos del tipo especificado
 */
export async function getMovesByType(type, limit = 50) {
  if (!type) {
    throw new Error('Tipo de movimiento es requerido');
  }

  try {
    // Obtiene información del tipo
    const typeResponse = await apiClient.get(`${API_CONFIG.ENDPOINTS.TYPE}/${type}`);
    
    if (!typeResponse.moves || typeResponse.moves.length === 0) {
      return [];
    }

    // Obtiene detalles de los movimientos del tipo
    const moveRequests = typeResponse.moves.slice(0, limit).map(moveEntry => ({
      endpoint: moveEntry.move.url.replace(API_CONFIG.BASE_URL, ''),
      params: {},
      options: { useCache: true }
    }));

    const moveDetails = await apiClient.getMany(moveRequests);
    
    return moveDetails
      .filter(result => !result.error)
      .map(move => ({
        id: move.id,
        name: move.name,
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MOVES}/${move.id}`,
        type: move.type?.name || type,
        power: move.power,
        accuracy: move.accuracy,
        pp: move.pp
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
      
  } catch (error) {
    console.error(`Error al obtener movimientos del tipo ${type}:`, error);
    throw new Error(`No se pudieron obtener movimientos del tipo "${type}"`);
  }
}

/**
 * Compara dos movimientos y sus estadísticas de Pokemon
 * @param {string|number} move1IdOrName - Primer movimiento
 * @param {string|number} move2IdOrName - Segundo movimiento
 * @returns {Promise<Object>} Comparación de los movimientos
 */
export async function compareMoves(move1IdOrName, move2IdOrName) {
  try {
    const [move1Details, move2Details] = await Promise.all([
      getMoveDetails(move1IdOrName),
      getMoveDetails(move2IdOrName)
    ]);

    const [move1PokemonByType, move2PokemonByType] = await Promise.all([
      getPokemonByMoveGroupedByType(move1IdOrName),
      getPokemonByMoveGroupedByType(move2IdOrName)
    ]);

    return {
      move1: move1Details,
      move2: move2Details,
      pokemonCount: {
        move1: move1PokemonByType,
        move2: move2PokemonByType
      },
      comparison: {
        powerComparison: compareStat(move1Details.power, move2Details.power),
        accuracyComparison: compareStat(move1Details.accuracy, move2Details.accuracy),
        ppComparison: compareStat(move1Details.pp, move2Details.pp),
        totalPokemonComparison: compareStat(
          move1PokemonByType.reduce((sum, type) => sum + type.count, 0),
          move2PokemonByType.reduce((sum, type) => sum + type.count, 0)
        )
      }
    };
  } catch (error) {
    console.error('Error al comparar movimientos:', error);
    throw new Error('No se pudieron comparar los movimientos');
  }
}

/**
 * Función auxiliar para comparar estadísticas
 * @private
 * @param {number|null} stat1 - Primera estadística
 * @param {number|null} stat2 - Segunda estadística
 * @returns {Object} Resultado de la comparación
 */
function compareStat(stat1, stat2) {
  if (stat1 === null && stat2 === null) {
    return { winner: 'tie', difference: 0 };
  }
  if (stat1 === null) {
    return { winner: 'move2', difference: stat2 };
  }
  if (stat2 === null) {
    return { winner: 'move1', difference: stat1 };
  }
  
  const difference = stat1 - stat2;
  return {
    winner: difference > 0 ? 'move1' : difference < 0 ? 'move2' : 'tie',
    difference: Math.abs(difference)
  };
} 