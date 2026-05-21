


 

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
// export const apiCall = async <T>(
//   endpoint: string,
//   options: RequestInit = {}
// ): Promise<T> => {
//   const response = await fetchWithAuth(endpoint, options)
//
//   if (!response.ok) {
//     const error: ApiError = new Error(
//       `Erreur API: ${response.status}`
//     ) as ApiError
//     error.status = response.status
//     throw error
//   }
//
//   return response.json()
// }
