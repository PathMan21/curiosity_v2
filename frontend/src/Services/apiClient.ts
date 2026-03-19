const API_URL = 'http://localhost:3000/api'

interface RefreshResponse {
  status: string
  accessToken: string
  refreshToken: string
}

interface ApiError extends Error {
  status: number
}

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


export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('authToken')
  const refreshToken = localStorage.getItem('refreshToken')

  const headers: HeadersInit = {
    ...(options.headers || {}),
  }

  if (!headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const mergedOptions = {
    ...options,
    headers,
  }

  let response = await fetch(`${API_URL}${endpoint}`, mergedOptions)

  if (response.status === 401 && refreshToken) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
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

      headers.Authorization = `Bearer ${refreshed.accessToken}`
      response = await fetch(`${API_URL}${endpoint}`, {
        ...mergedOptions,
        headers,
      })
    } catch (error) {
      processQueue(error, null)

      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')

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
