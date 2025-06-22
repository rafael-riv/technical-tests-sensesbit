/**
 * Definiciones de tipos para Pokemon usando JSDoc
 * Estas definiciones ayudan con el autocompletado y documentación
 */

/**
 * @typedef {Object} PokemonTypeInfo
 * @property {string} name - Nombre del tipo (ej: "fire", "water")
 * @property {string} url - URL de la API para este tipo
 */

/**
 * @typedef {Object} PokemonType
 * @property {number} slot - Posición del tipo (1 para primario, 2 para secundario)
 * @property {PokemonTypeInfo} type - Información del tipo
 */

/**
 * @typedef {Object} PokemonAbility
 * @property {Object} ability - Información de la habilidad
 * @property {string} ability.name - Nombre de la habilidad
 * @property {string} ability.url - URL de la API para esta habilidad
 * @property {boolean} is_hidden - Si es una habilidad oculta
 * @property {number} slot - Posición de la habilidad
 */

/**
 * @typedef {Object} PokemonStat
 * @property {number} base_stat - Valor base de la estadística
 * @property {number} effort - Puntos de esfuerzo que otorga
 * @property {Object} stat - Información de la estadística
 * @property {string} stat.name - Nombre de la estadística (hp, attack, etc.)
 * @property {string} stat.url - URL de la API para esta estadística
 */

/**
 * @typedef {Object} PokemonMove
 * @property {Object} move - Información del movimiento
 * @property {string} move.name - Nombre del movimiento
 * @property {string} move.url - URL de la API para este movimiento
 * @property {Array} version_group_details - Detalles por versión del juego
 */

/**
 * @typedef {Object} PokemonSprites
 * @property {string|null} front_default - Sprite frontal por defecto
 * @property {string|null} front_shiny - Sprite frontal shiny
 * @property {string|null} back_default - Sprite trasero por defecto
 * @property {string|null} back_shiny - Sprite trasero shiny
 * @property {Object} other - Otros sprites
 * @property {Object} other.dream_world - Sprites de Dream World
 * @property {Object} other.home - Sprites de Pokemon Home
 * @property {Object} other.official-artwork - Arte oficial
 * @property {string|null} other.official-artwork.front_default - Arte oficial frontal
 */

/**
 * @typedef {Object} Pokemon
 * @property {number} id - ID único del Pokemon
 * @property {string} name - Nombre del Pokemon
 * @property {number} height - Altura en decímetros
 * @property {number} weight - Peso en hectogramos
 * @property {number} base_experience - Experiencia base
 * @property {number} order - Orden en la Pokedex
 * @property {boolean} is_default - Si es la forma por defecto
 * @property {PokemonType[]} types - Tipos del Pokemon
 * @property {PokemonAbility[]} abilities - Habilidades del Pokemon
 * @property {PokemonStat[]} stats - Estadísticas del Pokemon
 * @property {PokemonMove[]} moves - Movimientos que puede aprender
 * @property {PokemonSprites} sprites - Imágenes del Pokemon
 * @property {Object} species - Información de la especie
 * @property {string} species.name - Nombre de la especie
 * @property {string} species.url - URL de la API para la especie
 */

/**
 * @typedef {Object} PokemonSpecies
 * @property {number} id - ID de la especie
 * @property {string} name - Nombre de la especie
 * @property {number} order - Orden en la Pokedex Nacional
 * @property {number} gender_rate - Proporción de género
 * @property {number} capture_rate - Tasa de captura
 * @property {number} base_happiness - Felicidad base
 * @property {boolean} is_baby - Si es un Pokemon bebé
 * @property {boolean} is_legendary - Si es legendario
 * @property {boolean} is_mythical - Si es mítico
 * @property {number} hatch_counter - Contador de eclosión
 * @property {boolean} has_gender_differences - Si tiene diferencias de género
 * @property {boolean} forms_switchable - Si puede cambiar de forma
 * @property {Object|null} evolution_chain - Cadena evolutiva
 * @property {string} evolution_chain.url - URL de la cadena evolutiva
 * @property {Array} names - Nombres en diferentes idiomas
 * @property {Array} flavor_text_entries - Descripciones del Pokemon
 */

/**
 * @typedef {Object} EvolutionChain
 * @property {number} id - ID de la cadena evolutiva
 * @property {Object} baby_trigger_item - Item que activa la evolución bebé
 * @property {EvolutionLink} chain - Cadena de evoluciones
 */

/**
 * @typedef {Object} EvolutionLink
 * @property {boolean} is_baby - Si es un Pokemon bebé
 * @property {Object} species - Especie de este eslabón
 * @property {string} species.name - Nombre de la especie
 * @property {string} species.url - URL de la especie
 * @property {Array} evolution_details - Detalles de la evolución
 * @property {EvolutionLink[]} evolves_to - A qué Pokemon evoluciona
 */

/**
 * @typedef {Object} EvolutionDetail
 * @property {Object|null} item - Item necesario para evolucionar
 * @property {Object|null} trigger - Gatillo de evolución
 * @property {number|null} gender - Género requerido
 * @property {Object|null} held_item - Item que debe sostener
 * @property {Object|null} known_move - Movimiento que debe conocer
 * @property {Object|null} known_move_type - Tipo de movimiento que debe conocer
 * @property {Object|null} location - Ubicación requerida
 * @property {number|null} min_level - Nivel mínimo
 * @property {number|null} min_happiness - Felicidad mínima
 * @property {number|null} min_beauty - Belleza mínima
 * @property {number|null} min_affection - Afecto mínimo
 * @property {boolean} needs_overworld_rain - Si necesita lluvia
 * @property {Object|null} party_species - Especie requerida en el equipo
 * @property {Object|null} party_type - Tipo requerido en el equipo
 * @property {number|null} relative_physical_stats - Estadísticas físicas relativas
 * @property {string} time_of_day - Momento del día requerido
 * @property {Object|null} trade_species - Especie para intercambio
 * @property {boolean} turn_upside_down - Si debe girar la consola
 */

/**
 * @typedef {Object} SimplePokemon
 * Versión simplificada para listas y cards
 * @property {number} id - ID del Pokemon
 * @property {string} name - Nombre del Pokemon
 * @property {string} url - URL de la API
 * @property {string|null} image - URL de la imagen
 * @property {string[]} types - Array con los nombres de los tipos
 */

/**
 * @typedef {Object} PokemonListResponse
 * Respuesta de la API para listas paginadas
 * @property {number} count - Total de Pokemon
 * @property {string|null} next - URL de la siguiente página
 * @property {string|null} previous - URL de la página anterior
 * @property {Array<{name: string, url: string}>} results - Resultados
 */

/**
 * @typedef {Object} FilteredPokemon
 * Pokemon con información adicional para filtros
 * @property {Pokemon} pokemon - Datos completos del Pokemon
 * @property {number} heightInMeters - Altura en metros (calculada)
 * @property {number} weightInKilograms - Peso en kilogramos (calculado)
 * @property {number} movesCount - Cantidad de movimientos
 * @property {string} primaryType - Tipo principal
 * @property {boolean} isSelected - Si está seleccionado para comparación
 */

// Exports vacíos para que el archivo sea un módulo válido
export {}; 