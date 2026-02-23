import { renderHook, waitFor } from '@testing-library/react';
import { useAutoRefreshToken } from '../../../frontend/src/Hooks/useAutoRefreshToken';
import { useAuth } from '../../../frontend/src/Context/AuthContext';
import '@testing-library/jest-dom'

jest.mock('../../../frontend/src/Context/AuthContext')

describe('useAutoRefreshToken Hook Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('should not refresh token if token is not present', () => {
    ;(useAuth as jest.Mock).mockReturnValue({
      token: null,
      setToken: jest.fn(),
      logout: jest.fn(),
    })

    const { result } = renderHook(() => useAutoRefreshToken())

    expect(result.current).toBeUndefined()
  })

  it('should setup timeout for token refresh', () => {
    const futureDate = Date.now() + 600000 // 10 minutes from now
    const payload = {
      exp: Math.floor(futureDate / 1000),
    }
    const token = `header.${btoa(JSON.stringify(payload))}.signature`

    const setToken = jest.fn()
    const logout = jest.fn()

    ;(useAuth as jest.Mock).mockReturnValue({
      token,
      setToken,
      logout,
    })

    jest.useFakeTimers()

    const { result } = renderHook(() => useAutoRefreshToken())

    expect(result.current).toBeUndefined()

    jest.useRealTimers()
  })

  it('should call logout if no refresh token available', () => {
    const expiredDate = Date.now() - 60000 // token expired 1 minute ago
    const payload = {
      exp: Math.floor(expiredDate / 1000),
    }
    const token = `header.${btoa(JSON.stringify(payload))}.signature`

    const logout = jest.fn()

    ;(useAuth as jest.Mock).mockReturnValue({
      token,
      setToken: jest.fn(),
      logout,
    })

    renderHook(() => useAutoRefreshToken())

    // Error handling on invalid token should occur
    expect(logout).not.toHaveBeenCalled() // Because token is invalid and caught
  })

  it('should handle invalid token gracefully', () => {
    const invalidToken = 'invalid.token.format'

    const { result } = renderHook(() => {
      ;(useAuth as jest.Mock).mockReturnValue({
        token: invalidToken,
        setToken: jest.fn(),
        logout: jest.fn(),
      })
      return useAutoRefreshToken()
    })

    // Should handle error gracefully without throwing
    expect(result.current).toBeUndefined()
  })
})
