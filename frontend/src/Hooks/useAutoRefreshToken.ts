import { useEffect } from 'react'
import { useAuthentification } from '../Context/Auth'

const API_URL = import.meta.env?.VITE_SERVER_URL || ''

export const useAutoRefreshToken = () => {
  const context = useAuthentification()
  const token = context?.accessToken || (context as any)?.token
  const logout = context?.logout
  const setToken = (context as any)?.setToken

  useEffect(() => {
    if (!token) return

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = payload.exp * 1000
      const now = Date.now()
      const timeUntilExpiry = expirationTime - now
      const refreshTime = timeUntilExpiry - 60000

      if (refreshTime <= 0) {
        if (logout) logout()
        return
      }

      const timeout = setTimeout(() => {
        refreshAccessToken()
      }, refreshTime)

      return () => clearTimeout(timeout)
    } catch (error) {
      console.error('Erreur lors du parsing du token:', error)
    }
  }, [token])

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken')

    if (!refreshToken) {
      if (logout) logout()
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/users/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) {
        throw new Error('Refresh token failed')
      }

      const data = await response.json()
      if (setToken) {
        setToken(data.accessToken, data.refreshToken)
      }
    } catch (error) {
      console.error('Erreur lors du refresh token:', error)
      if (logout) logout()
    }
  }
}
