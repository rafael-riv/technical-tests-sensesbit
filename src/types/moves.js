/**
 * Definiciones de tipos para Moves (Movimientos) usando JSDoc
 * Estas definiciones ayudan con el autocompletado y documentación
 */

/**
 * @typedef {Object} MoveTarget
 * @property {string} name - Nombre del objetivo del movimiento
 * @property {string} url - URL de la API para este objetivo
 */

/**
 * @typedef {Object} MoveDamageClass
 * @property {string} name - Clase de daño (physical, special, status)
 * @property {string} url - URL de la API para esta clase
 */

/**
 * @typedef {Object} MoveType
 * @property {string} name - Tipo del movimiento (fire, water, etc.)
 * @property {string} url - URL de la API para este tipo
 */

/**
 * @typedef {Object} MoveGeneration
 * @property {string} name - Generación donde se introdujo
 * @property {string} url - URL de la API para esta generación
 */

/**
 * @typedef {Object} MoveMeta
 * @property {Object|null} ailment - Estado que causa
 * @property {number} ailment_chance - Probabilidad de causar el estado
 * @property {number} category - Categoría del movimiento
 * @property {number} crit_rate - Tasa de crítico
 * @property {number} drain - Porcentaje de drenaje
 * @property {number} flinch_chance - Probabilidad de retroceso
 * @property {number} healing - Porcentaje de curación
 * @property {number} max_hits - Máximo número de golpes
 * @property {number} max_turns - Máximo número de turnos
 * @property {number} min_hits - Mínimo número de golpes
 * @property {number} min_turns - Mínimo número de turnos
 * @property {number} stat_chance - Probabilidad de cambio de estadística
 */

/**
 * @typedef {Object} MoveStatChange
 * @property {number} change - Cantidad del cambio (-6 a +6)
 * @property {Object} stat - Estadística que cambia
 * @property {string} stat.name - Nombre de la estadística
 * @property {string} stat.url - URL de la API para esta estadística
 */

/**
 * @typedef {Object} MoveFlavorText
 * @property {string} flavor_text - Descripción del movimiento
 * @property {Object} language - Idioma de la descripción
 * @property {string} language.name - Código del idioma
 * @property {Object} version_group - Grupo de versiones del juego
 * @property {string} version_group.name - Nombre del grupo de versiones
 */

/**
 * @typedef {Object} MoveName
 * @property {string} name - Nombre del movimiento
 * @property {Object} language - Idioma del nombre
 * @property {string} language.name - Código del idioma
 */

/**
 * @typedef {Object} MovePokemon
 * @property {string} name - Nombre del Pokemon que puede aprender el movimiento
 * @property {string} url - URL de la API para este Pokemon
 */

/**
 * @typedef {Object} Move
 * @property {number} id - ID único del movimiento
 * @property {string} name - Nombre del movimiento
 * @property {number|null} accuracy - Precisión del movimiento (0-100)
 * @property {number} effect_chance - Probabilidad del efecto secundario
 * @property {number|null} pp - Puntos de poder (usos del movimiento)
 * @property {number} priority - Prioridad del movimiento
 * @property {number|null} power - Poder del movimiento (daño base)
 * @property {MoveTarget} target - Objetivo del movimiento
 * @property {MoveDamageClass} damage_class - Clase de daño
 * @property {MoveType} type - Tipo del movimiento
 * @property {MoveGeneration} generation - Generación de introducción
 * @property {MoveMeta} meta - Metadatos del movimiento
 * @property {MoveStatChange[]} stat_changes - Cambios de estadísticas
 * @property {MovePokemon[]} learned_by_pokemon - Pokemon que lo aprenden
 * @property {MoveFlavorText[]} flavor_text_entries - Descripciones
 * @property {MoveName[]} names - Nombres en diferentes idiomas
 * @property {Array} effect_entries - Entradas de efectos
 * @property {Object|null} contest_type - Tipo de concurso
 * @property {Object|null} contest_effect - Efecto en concursos
 * @property {Object|null} super_contest_effect - Efecto en super concursos
 */

/**
 * @typedef {Object} SimpleMove
 * Versión simplificada para selectores y listas
 * @property {number} id - ID del movimiento
 * @property {string} name - Nombre del movimiento
 * @property {string} url - URL de la API
 * @property {string} type - Tipo del movimiento
 * @property {number|null} power - Poder del movimiento
 * @property {number|null} accuracy - Precisión del movimiento
 * @property {number} pp - Puntos de poder
 */

/**
 * @typedef {Object} MoveListResponse
 * Respuesta de la API para listas paginadas de movimientos
 * @property {number} count - Total de movimientos
 * @property {string|null} next - URL de la siguiente página
 * @property {string|null} previous - URL de la página anterior
 * @property {Array<{name: string, url: string}>} results - Resultados
 */

/**
 * @typedef {Object} MoveComparison
 * Datos para comparar dos movimientos
 * @property {Move} move1 - Primer movimiento
 * @property {Move} move2 - Segundo movimiento
 * @property {Object} pokemonCount - Conteo de Pokemon por tipo
 * @property {Object} pokemonCount.move1 - Conteo para el primer movimiento
 * @property {Object} pokemonCount.move2 - Conteo para el segundo movimiento
 */

/**
 * @typedef {Object} MovePokemonByType
 * Pokemon que aprenden un movimiento, agrupados por tipo
 * @property {string} type - Nombre del tipo
 * @property {number} count - Cantidad de Pokemon de este tipo
 * @property {Array<string>} pokemonNames - Nombres de los Pokemon
 */

/**
 * @typedef {Object} MoveEffectiveness
 * Efectividad de tipos en combate
 * @property {string} type - Tipo atacante
 * @property {Object} effectiveness - Efectividad contra otros tipos
 * @property {number} effectiveness.normal - Multiplicador vs tipo normal
 * @property {number} effectiveness.fire - Multiplicador vs tipo fuego
 * // ... más tipos
 */

/**
 * @typedef {Object} MoveCategory
 * Categorías de movimientos para filtros
 * @property {string} name - Nombre de la categoría
 * @property {string} description - Descripción de la categoría
 * @property {Array<string>} moves - Movimientos en esta categoría
 */

/**
 * @typedef {Object} MoveFilter
 * Filtros aplicables a movimientos
 * @property {string|null} type - Filtrar por tipo
 * @property {string|null} damageClass - Filtrar por clase de daño
 * @property {number|null} minPower - Poder mínimo
 * @property {number|null} maxPower - Poder máximo
 * @property {number|null} minAccuracy - Precisión mínima
 * @property {number|null} maxAccuracy - Precisión máxima
 * @property {number|null} minPP - PP mínimo
 * @property {number|null} maxPP - PP máximo
 * @property {string} sortBy - Campo para ordenar
 * @property {string} sortOrder - Orden (asc, desc)
 */

/**
 * @typedef {Object} MoveStats
 * Estadísticas calculadas de un movimiento
 * @property {number} totalPokemon - Total de Pokemon que lo aprenden
 * @property {Object} pokemonByType - Pokemon agrupados por tipo principal
 * @property {Array<string>} mostCommonTypes - Tipos más comunes que lo aprenden
 * @property {number} averageLevel - Nivel promedio de aprendizaje
 * @property {string} rarity - Rareza del movimiento (common, uncommon, rare)
 */

// Exports vacíos para que el archivo sea un módulo válido
export {}; 