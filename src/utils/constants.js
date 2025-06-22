/**
 * Configuraciones y constantes globales de la aplicación Pokemon
 */

// === URLs DE LA API ===
export const API_CONFIG = {
  BASE_URL: 'https://pokeapi.co/api/v2',
  ENDPOINTS: {
    MOVES: '/move',
    POKEMON: '/pokemon',
    POKEMON_SPECIES: '/pokemon-species',
    EVOLUTION_CHAIN: '/evolution-chain',
    TYPE: '/type'
  }
};

// === CONFIGURACIÓN DE PAGINACIÓN ===
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MOVES_LIMIT: 50
};

// === CONFIGURACIÓN DE CACHÉ ===
export const CACHE_CONFIG = {
  EXPIRY_TIME: 5 * 60 * 1000, // 5 minutos en milisegundos
  MAX_ENTRIES: 100
};

// === CONFIGURACIÓN DE FILTROS ===
export const FILTERS = {
  HEIGHT: {
    MIN: 0,
    MAX: 200, // en decímetros (20 metros)
    STEP: 1
  },
  WEIGHT: {
    MIN: 0,
    MAX: 10000, // en hectogramos (1000 kg)
    STEP: 10
  },
  SORT_OPTIONS: [
    { value: 'name', label: 'Nombre A-Z' },
    { value: 'name-desc', label: 'Nombre Z-A' },
    { value: 'height', label: 'Altura (menor a mayor)' },
    { value: 'height-desc', label: 'Altura (mayor a menor)' },
    { value: 'weight', label: 'Peso (menor a mayor)' },
    { value: 'weight-desc', label: 'Peso (mayor a menor)' }
  ]
};

// === TIPOS DE POKEMON ===
export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
];

// === COLORES POR TIPO ===
export const TYPE_COLORS = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC'
};

// === ESTADÍSTICAS DE POKEMON ===
export const STATS = {
  NAMES: ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'],
  LABELS: {
    'hp': 'HP',
    'attack': 'Ataque',
    'defense': 'Defensa',
    'special-attack': 'Ataque Especial',
    'special-defense': 'Defensa Especial',
    'speed': 'Velocidad'
  }
};

// === CONFIGURACIÓN DE GRÁFICOS ===
export const CHART_CONFIG = {
  COLORS: ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
  POKEMON_COMPARISON_METRICS: ['height', 'weight', 'moves_count'],
  MOVE_COMPARISON_METRICS: ['power', 'accuracy', 'pp']
};

// === MENSAJES DE ERROR ===
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  NOT_FOUND: 'Recurso no encontrado.',
  GENERIC_ERROR: 'Ha ocurrido un error inesperado.',
  LOADING_FAILED: 'Error al cargar los datos.'
};

// === CONFIGURACIÓN DE IMÁGENES ===
export const IMAGE_CONFIG = {
  PLACEHOLDER: '/placeholder-pokemon.png',
  SPRITE_TYPES: {
    OFFICIAL: 'official-artwork',
    FRONT_DEFAULT: 'front_default',
    FRONT_SHINY: 'front_shiny'
  }
}; 