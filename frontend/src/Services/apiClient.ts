const API_URL = 'http://localhost:3000/api'

// Interface pour la réponse de refresh token
interface RefreshResponse {
  status: string
  accessToken: string
  refreshToken: string
}

// Interface pour les erreurs API
interface ApiError extends Error {
  status: number
}

// Flag pour éviter les boucles de refresh infinies
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: string) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })

  isRefreshing = false
  failedQueue = []
}

/**
 * Effectue un fetch avec gestion automatique des refresh tokens
 */
export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('authToken')
  const refreshToken = localStorage.getItem('refreshToken')

  // Créer les headers sans modifier l'original
  const headers: HeadersInit = {
    ...(options.headers || {}),
  }

  // Ajouter Content-Type seulement si elle n'existe pas et si on a un body
  if (!headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json'
  }

  // Ajouter le token au header si disponible
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const mergedOptions = {
    ...options,
    headers,
  }

  let response = await fetch(`${API_URL}${endpoint}`, mergedOptions)

  // Gérer les erreurs 401 avec refresh token
  if (response.status === 401 && refreshToken) {
    if (isRefreshing) {
      // Si un refresh est déjà en cours, attendre la file d'attente
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            // Refaire la requête avec le nouveau token
            mergedOptions.headers = {
              ...mergedOptions.headers,
              Authorization: `Bearer ${token}`,
            }
            fetch(`${API_URL}${endpoint}`, mergedOptions)
              .then(resolve)
              .catch(reject)
          },
          reject,
        })
      })
    }

    isRefreshing = true

    try {
      const refreshed = await refreshAccessToken(refreshToken)

      localStorage.setItem('authToken', refreshed.accessToken)
      localStorage.setItem('refreshToken', refreshed.refreshToken)

      processQueue(null, refreshed.accessToken)

      // Refaire la requête avec le nouveau token
      headers.Authorization = `Bearer ${refreshed.accessToken}`
      response = await fetch(`${API_URL}${endpoint}`, {
        ...mergedOptions,
        headers,
      })
    } catch (error) {
      processQueue(error, null)

      // Nettoyer les tokens et rediriger vers login
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')

      // Utiliser replace pour éviter de pouvoir revenir en arrière
      window.location.replace('/login')

      throw error
    }
  }

  return response
}

/**
 * Rafraîchit l'access token
 */
const refreshAccessToken = async (
  refreshToken: string
): Promise<RefreshResponse> => {
  const response = await fetch(`${API_URL}/users/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    throw new Error('Impossible de rafraîchir le token')
  }

  return response.json()
}

/**
 * Wrapper fetch standard pour les requêtes avec authentification
 */
export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetchWithAuth(endpoint, options)

  if (!response.ok) {
    const error: ApiError = new Error(
      `Erreur API: ${response.status}`
    ) as ApiError
    error.status = response.status
    throw error
  }

  return response.json()
}
