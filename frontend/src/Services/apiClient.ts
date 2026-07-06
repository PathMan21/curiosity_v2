const API_URL = (typeof window !== 'undefined' && window.location?.origin) || ''

interface ApiError extends Error {
  status: number
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const token = localStorage.getItem('authToken')

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  } as Record<string, string>

  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = new Error(
      `Request failed with status ${response.status}`
    ) as ApiError
    error.status = response.status
    throw error
  }

  return response.json()
}

export async function getArticles() {
  return fetchWithAuth('/api/openalex')
}

export async function getPhotos() {
  return fetchWithAuth('/api/unsplash')
}

export async function updateProfile(data: any) {
  return fetchWithAuth('/api/user/updated-profile', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
