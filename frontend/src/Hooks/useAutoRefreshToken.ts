import { useEffect } from 'react'
import { useAuth } from '../Context/AuthContext'

/**
 * Hook pour rafraîchir automatiquement le token avant son expiration
 * Rafraîchit le token 1 minute avant son expiration
 */
export const useAutoRefreshToken = () => {
  const { token, setToken, logout } = useAuth()

  useEffect(() => {
    if (!token) return

    // Décoder le token pour obtenir son expiration
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expirationTime = payload.exp * 1000 // Convertir en millisecondes
      const now = Date.now()
      const timeUntilExpiry = expirationTime - now
      const refreshTime = timeUntilExpiry - 60000 // Rafraîchir 1 minute avant l'expiration

      if (refreshTime <= 0) {
        // Token déjà expiré, le service apiClient gèrera le refresh
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
      logout()
      return
    }

    try {
      const response = await fetch(
        'http://localhost:3000/api/users/refresh-token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        }
      )

      if (!response.ok) {
        throw new Error('Refresh token failed')
      }

      const data = await response.json()
      setToken(data.accessToken, data.refreshToken)
    } catch (error) {
      console.error('Erreur lors du refresh token:', error)
      logout()
    }
  }
}
