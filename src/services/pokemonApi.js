/**
 * Servicio para interactuar con los endpoints de Pokemon de la PokeAPI
 * Proporciona funciones para obtener información de Pokemon
 */

import { apiClient } from './apiClient.js';
import { API_CONFIG, PAGINATION, IMAGE_CONFIG } from '../utils/constants.js';

/**
 * @typedef {import('../types/pokemon.js').Pokemon} Pokemon
 * @typedef {import('../types/pokemon.js').SimplePokemon} SimplePokemon
 * @typedef {import('../types/pokemon.js').PokemonListResponse} PokemonListResponse
 * @typedef {import('../types/pokemon.js').PokemonSpecies} PokemonSpecies
 * @typedef {import('../types/pokemon.js').EvolutionChain} EvolutionChain
 * @typedef {import('../types/pokemon.js').FilteredPokemon} FilteredPokemon
 */

/**
 * Obtiene la lista completa de Pokemon disponibles
 * @param {Object} [options] - Opciones de paginación
 * @param {number} [options.limit] - Límite de resultados (default: 20)
 * @param {number} [options.offset] - Desplazamiento para paginación (default: 0)
 * @returns {Promise<PokemonListResponse>} Lista de Pokemon
 */
export async function getAllPokemon(options = {}) {
  const {
    limit = PAGINATION.DEFAULT_LIMIT,
    offset = 0
  } = options;

  try {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.POKEMON, {
      limit,
      offset
    });

    return response;
  } catch (error) {
    console.error('Error al obtener lista de Pokemon:', error);
    throw new Error('No se pudieron cargar los Pokemon disponibles');
  }
}

/**
 * Obtiene información detallada de un Pokemon específico
 * @param {string|number} pokemonIdOrName - ID o nombre del Pokemon
 * @returns {Promise<Pokemon>} Información completa del Pokemon
 */
export async function getPokemonDetails(pokemonIdOrName) {
  if (!pokemonIdOrName) {
    throw new Error('ID o nombre del Pokemon es requerido');
  }

  try {
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.POKEMON}/${pokemonIdOrName}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener detalles del Pokemon ${pokemonIdOrName}:`, error);
    throw new Error(`No se pudieron obtener los detalles del Pokemon "${pokemonIdOrName}"`);
  }
}

/**
 * Obtiene información de la especie de un Pokemon
 * @param {string|number} pokemonIdOrName - ID o nombre del Pokemon
 * @returns {Promise<PokemonSpecies>} Información de la especie
 */
export async function getPokemonSpecies(pokemonIdOrName) {
  try {
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.POKEMON_SPECIES}/${pokemonIdOrName}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener especie del Pokemon ${pokemonIdOrName}:`, error);
    throw new Error(`No se pudo obtener información de la especie de "${pokemonIdOrName}"`);
  }
}

/**
 * Obtiene la cadena evolutiva de un Pokemon
 * @param {number} evolutionChainId - ID de la cadena evolutiva
 * @returns {Promise<EvolutionChain>} Cadena evolutiva
 */
export async function getEvolutionChain(evolutionChainId) {
  try {
    const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.EVOLUTION_CHAIN}/${evolutionChainId}`);
    return response;
  } catch (error) {
    console.error(`Error al obtener cadena evolutiva ${evolutionChainId}:`, error);
    throw new Error('No se pudo obtener la cadena evolutiva');
  }
}

/**
 * Obtiene todos los Pokemon que pueden aprender un movimiento específico
 * @param {Array<{name: string, url: string}>} pokemonList - Lista de Pokemon
 * @returns {Promise<SimplePokemon[]>} Pokemon con información básica
 */
export async function getPokemonListDetails(pokemonList) {
  if (!pokemonList || pokemonList.length === 0) {
    return [];
  }

  try {
    // Obtiene detalles de los Pokemon en paralelo
    const pokemonRequests = pokemonList.map(pokemon => ({
      endpoint: pokemon.url.replace(API_CONFIG.BASE_URL, ''),
      params: {},
      options: { useCache: true }
    }));

    const pokemonDetails = await apiClient.getMany(pokemonRequests);
    
    const simplePokemon = pokemonDetails
      .filter(result => !result.error)
      .map(pokemon => ({
        id: pokemon.id,
        name: pokemon.name,
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POKEMON}/${pokemon.id}`,
        image: getPokemonImageUrl(pokemon),
        types: pokemon.types?.map(type => type.type.name) || [],
        height: pokemon.height, // En decímetros
        weight: pokemon.weight  // En hectogramos
      }));

    return simplePokemon.sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error('Error al obtener detalles de la lista de Pokemon:', error);
    throw new Error('No se pudieron obtener los detalles de los Pokemon');
  }
}

/**
 * Obtiene Pokemon con información adicional para filtros
 * @param {Array<{name: string, url: string}>} pokemonList - Lista de Pokemon
 * @returns {Promise<FilteredPokemon[]>} Pokemon con información para filtros
 */
export async function getFilteredPokemonList(pokemonList) {
  if (!pokemonList || pokemonList.length === 0) {
    return [];
  }

  try {
    const pokemonRequests = pokemonList.map(pokemon => ({
      endpoint: pokemon.url.replace(API_CONFIG.BASE_URL, ''),
      params: {},
      options: { useCache: true }
    }));

    const pokemonDetails = await apiClient.getMany(pokemonRequests);
    
    const filteredPokemon = pokemonDetails
      .filter(result => !result.error)
      .map(pokemon => ({
        pokemon,
        heightInMeters: pokemon.height / 10, // Convierte decímetros a metros
        weightInKilograms: pokemon.weight / 10, // Convierte hectogramos a kg
        movesCount: pokemon.moves?.length || 0,
        primaryType: pokemon.types?.[0]?.type?.name || 'unknown',
        isSelected: false
      }));

    return filteredPokemon.sort((a, b) => a.pokemon.id - b.pokemon.id);
  } catch (error) {
    console.error('Error al obtener Pokemon filtrados:', error);
    throw new Error('No se pudieron obtener los Pokemon con información de filtros');
  }
}

/**
 * Busca Pokemon por nombre (búsqueda parcial)
 * @param {string} searchTerm - Término de búsqueda
 * @param {number} limit - Límite de resultados
 * @returns {Promise<SimplePokemon[]>} Pokemon que coinciden con la búsqueda
 */
export async function searchPokemon(searchTerm, limit = 20) {
  if (!searchTerm || searchTerm.trim().length < 2) {
    return [];
  }

  try {
    const allPokemon = await getAllPokemon({ limit: 200 });
    
    // Filtra Pokemon que coincidan con el término de búsqueda
    const matchingPokemon = allPokemon.results.filter(pokemon =>
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, limit);

    return await getPokemonListDetails(matchingPokemon);
  } catch (error) {
    console.error('Error al buscar Pokemon:', error);
    throw new Error('No se pudo realizar la búsqueda de Pokemon');
  }
}

/**
 * Obtiene Pokemon filtrados por tipo
 * @param {string} type - Tipo de Pokemon (fire, water, etc.)
 * @param {number} limit - Límite de resultados
 * @returns {Promise<SimplePokemon[]>} Pokemon del tipo especificado
 */
export async function getPokemonByType(type, limit = 50) {
  if (!type) {
    throw new Error('Tipo de Pokemon es requerido');
  }

  try {
    // Obtiene información del tipo
    const typeResponse = await apiClient.get(`${API_CONFIG.ENDPOINTS.TYPE}/${type}`);
    
    if (!typeResponse.pokemon || typeResponse.pokemon.length === 0) {
      return [];
    }

    // Extrae la lista de Pokemon del tipo
    const pokemonList = typeResponse.pokemon.slice(0, limit).map(entry => ({
      name: entry.pokemon.name,
      url: entry.pokemon.url
    }));

    return await getPokemonListDetails(pokemonList);
  } catch (error) {
    console.error(`Error al obtener Pokemon del tipo ${type}:`, error);
    throw new Error(`No se pudieron obtener Pokemon del tipo "${type}"`);
  }
}

/**
 * Obtiene las evoluciones de un Pokemon
 * @param {string|number} pokemonIdOrName - ID o nombre del Pokemon
 * @returns {Promise<Array<{name: string, id: number, image: string}>>} Lista de evoluciones
 */
export async function getPokemonEvolutions(pokemonIdOrName) {
  try {
    // Obtiene información de la especie
    const species = await getPokemonSpecies(pokemonIdOrName);
    
    if (!species.evolution_chain?.url) {
      return [];
    }

    // Extrae el ID de la cadena evolutiva de la URL
    const evolutionChainId = species.evolution_chain.url.split('/').slice(-2, -1)[0];
    const evolutionChain = await getEvolutionChain(evolutionChainId);

    // Procesa la cadena evolutiva
    const evolutions = [];
    let currentEvolution = evolutionChain.chain;

    while (currentEvolution) {
      // Obtiene detalles del Pokemon actual
      try {
        const pokemonDetails = await getPokemonDetails(currentEvolution.species.name);
        evolutions.push({
          name: currentEvolution.species.name,
          id: pokemonDetails.id,
          image: getPokemonImageUrl(pokemonDetails)
        });
      } catch (error) {
        console.warn(`No se pudieron obtener detalles de ${currentEvolution.species.name}`);
      }

      // Procesa la siguiente evolución (toma la primera si hay múltiples)
      currentEvolution = currentEvolution.evolves_to?.[0] || null;
    }

    return evolutions;
  } catch (error) {
    console.error(`Error al obtener evoluciones del Pokemon ${pokemonIdOrName}:`, error);
    throw new Error(`No se pudieron obtener las evoluciones de "${pokemonIdOrName}"`);
  }
}

/**
 * Compara dos Pokemon
 * @param {string|number} pokemon1IdOrName - Primer Pokemon
 * @param {string|number} pokemon2IdOrName - Segundo Pokemon
 * @returns {Promise<Object>} Comparación de los Pokemon
 */
export async function comparePokemon(pokemon1IdOrName, pokemon2IdOrName) {
  try {
    const [pokemon1, pokemon2] = await Promise.all([
      getPokemonDetails(pokemon1IdOrName),
      getPokemonDetails(pokemon2IdOrName)
    ]);

    return {
      pokemon1,
      pokemon2,
      comparison: {
        heightComparison: compareStat(pokemon1.height, pokemon2.height),
        weightComparison: compareStat(pokemon1.weight, pokemon2.weight),
        movesComparison: compareStat(pokemon1.moves?.length || 0, pokemon2.moves?.length || 0),
        baseExperienceComparison: compareStat(pokemon1.base_experience, pokemon2.base_experience),
        statsComparison: compareStats(pokemon1.stats, pokemon2.stats)
      }
    };
  } catch (error) {
    console.error('Error al comparar Pokemon:', error);
    throw new Error('No se pudieron comparar los Pokemon');
  }
}

/**
 * Obtiene la URL de la imagen de un Pokemon
 * @private
 * @param {Pokemon} pokemon - Datos del Pokemon
 * @returns {string} URL de la imagen
 */
function getPokemonImageUrl(pokemon) {
  // Prioridad: Arte oficial > Sprite frontal > Placeholder
  if (pokemon.sprites?.other?.['official-artwork']?.front_default) {
    return pokemon.sprites.other['official-artwork'].front_default;
  }
  
  if (pokemon.sprites?.front_default) {
    return pokemon.sprites.front_default;
  }
  
  return IMAGE_CONFIG.PLACEHOLDER;
}

/**
 * Función auxiliar para comparar estadísticas individuales
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
    return { winner: 'pokemon2', difference: stat2 };
  }
  if (stat2 === null) {
    return { winner: 'pokemon1', difference: stat1 };
  }
  
  const difference = stat1 - stat2;
  return {
    winner: difference > 0 ? 'pokemon1' : difference < 0 ? 'pokemon2' : 'tie',
    difference: Math.abs(difference)
  };
}

/**
 * Función auxiliar para comparar todas las estadísticas
 * @private
 * @param {Array} stats1 - Estadísticas del primer Pokemon
 * @param {Array} stats2 - Estadísticas del segundo Pokemon
 * @returns {Object} Comparación detallada de estadísticas
 */
function compareStats(stats1, stats2) {
  const comparison = {};
  
  if (!stats1 || !stats2) {
    return comparison;
  }

  // Crea mapas para facilitar la comparación
  const stats1Map = stats1.reduce((acc, stat) => {
    acc[stat.stat.name] = stat.base_stat;
    return acc;
  }, {});

  const stats2Map = stats2.reduce((acc, stat) => {
    acc[stat.stat.name] = stat.base_stat;
    return acc;
  }, {});

  // Compara cada estadística
  const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
  
  statNames.forEach(statName => {
    const stat1 = stats1Map[statName] || 0;
    const stat2 = stats2Map[statName] || 0;
    comparison[statName] = compareStat(stat1, stat2);
  });

  // Calcula totales
  const total1 = Object.values(stats1Map).reduce((sum, stat) => sum + stat, 0);
  const total2 = Object.values(stats2Map).reduce((sum, stat) => sum + stat, 0);
  comparison.total = compareStat(total1, total2);

  return comparison;
} 