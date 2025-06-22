/**
 * Cliente HTTP base para interactuar con la PokeAPI
 * Proporciona funcionalidades de caché, manejo de errores y rate limiting
 */

import { API_CONFIG, CACHE_CONFIG, ERROR_MESSAGES } from '../utils/constants.js';

/**
 * Cache en memoria para las respuestas de la API
 * @type {Map<string, {data: any, timestamp: number}>}
 */
const cache = new Map();

/**
 * Limpia entradas expiradas del caché
 */
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_CONFIG.EXPIRY_TIME) {
      cache.delete(key);
    }
  }
}

/**
 * Obtiene datos del caché si están disponibles y no han expirado
 * @param {string} key - Clave del caché
 * @returns {any|null} Datos del caché o null si no existen/expiraron
 */
function getFromCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > CACHE_CONFIG.EXPIRY_TIME) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

/**
 * Guarda datos en el caché
 * @param {string} key - Clave del caché
 * @param {any} data - Datos a guardar
 */
function saveToCache(key, data) {
  // Limpia caché si está lleno
  if (cache.size >= CACHE_CONFIG.MAX_ENTRIES) {
    cleanExpiredCache();
    
    // Si sigue lleno, elimina la entrada más antigua
    if (cache.size >= CACHE_CONFIG.MAX_ENTRIES) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
  }
  
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Clase principal del cliente API
 */
class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.requestQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Construye la URL completa para un endpoint
   * @param {string} endpoint - Endpoint de la API
   * @param {Object} params - Parámetros de consulta
   * @returns {string} URL completa
   */
  buildUrl(endpoint, params = {}) {
    const url = new URL(`${this.baseURL}${endpoint}`);
    
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    return url.toString();
  }

  /**
   * Maneja errores de la API de manera consistente
   * @param {Response} response - Respuesta de fetch
   * @param {string} url - URL que causó el error
   * @throws {Error} Error personalizado según el tipo de fallo
   */
  async handleApiError(response, url) {
    const errorData = {
      status: response.status,
      statusText: response.statusText,
      url
    };

    switch (response.status) {
      case 404:
        throw new Error(`${ERROR_MESSAGES.NOT_FOUND} (${url})`);
      case 429:
        throw new Error('Demasiadas solicitudes. Intenta más tarde.');
      case 500:
      case 502:
      case 503:
        throw new Error('Error del servidor. Intenta más tarde.');
      default:
        if (!response.ok) {
          throw new Error(`${ERROR_MESSAGES.GENERIC_ERROR} (${response.status})`);
        }
    }
  }

  /**
   * Realiza una petición HTTP GET con manejo de caché y errores
   * @param {string} endpoint - Endpoint de la API
   * @param {Object} [params] - Parámetros de consulta
   * @param {Object} [options] - Opciones adicionales
   * @param {boolean} [options.useCache] - Si usar caché (default: true)
   * @param {number} [options.timeout] - Timeout en ms (default: 10000)
   * @returns {Promise<any>} Datos de la respuesta
   */
  async get(endpoint, params = {}, options = {}) {
    const {
      useCache = true,
      timeout = 10000
    } = options;

    const url = this.buildUrl(endpoint, params);
    const cacheKey = url;

    // Intenta obtener del caché primero
    if (useCache) {
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        console.log(`[Cache Hit] ${url}`);
        return cachedData;
      }
    }

    try {
      console.log(`[API Request] ${url}`);
      
      // Configurar timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Maneja errores de HTTP
      if (!response.ok) {
        await this.handleApiError(response, url);
      }

      const data = await response.json();

      // Guarda en caché si está habilitado
      if (useCache) {
        saveToCache(cacheKey, data);
      }

      return data;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('La solicitud tardó demasiado tiempo.');
      }
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      
      // Re-lanza otros errores
      throw error;
    }
  }

  /**
   * Realiza múltiples peticiones en paralelo con manejo de errores
   * @param {Array<{endpoint: string, params?: Object, options?: Object}>} requests - Array de peticiones
   * @returns {Promise<Array<any>>} Array con los resultados
   */
  async getMany(requests) {
    const promises = requests.map(request => 
      this.get(request.endpoint, request.params || {}, request.options || {})
        .catch(error => ({ error: error.message, request }))
    );

    const results = await Promise.all(promises);
    
    // Filtra errores y los registra
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.warn('Errores en peticiones múltiples:', errors);
    }

    return results;
  }

  /**
   * Obtiene datos de una URL completa (útil para enlaces de la API)
   * @param {string} fullUrl - URL completa
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<any>} Datos de la respuesta
   */
  async getFromUrl(fullUrl, options = {}) {
    if (!fullUrl || !fullUrl.startsWith('http')) {
      throw new Error('URL inválida');
    }

    const cacheKey = fullUrl;
    const { useCache = true } = options;

    // Intenta obtener del caché
    if (useCache) {
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        await this.handleApiError(response, fullUrl);
      }

      const data = await response.json();

      if (useCache) {
        saveToCache(cacheKey, data);
      }

      return data;

    } catch (error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
      }
      throw error;
    }
  }

  /**
   * Limpia todo el caché
   */
  clearCache() {
    cache.clear();
    console.log('Caché limpiado');
  }

  /**
   * Obtiene estadísticas del caché
   * @returns {Object} Estadísticas del caché
   */
  getCacheStats() {
    cleanExpiredCache();
    return {
      size: cache.size,
      maxSize: CACHE_CONFIG.MAX_ENTRIES,
      expiryTime: CACHE_CONFIG.EXPIRY_TIME
    };
  }
}

// Exporta una instancia singleton
export const apiClient = new ApiClient();

// También exporta la clase por si se necesitan múltiples instancias
export { ApiClient }; 