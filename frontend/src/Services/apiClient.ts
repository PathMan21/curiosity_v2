


 

interface RefreshResponse {
  status: string
  accessToken: string
}

interface ApiError extends Error {
  status: number
}

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: string) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error, token = null) => {
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

const refreshAccessToken = async () => {
  const response = await fetch(`${API_URL}/api/user/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Impossible de rafraîchir le token')
  }

  return response.json()
}
