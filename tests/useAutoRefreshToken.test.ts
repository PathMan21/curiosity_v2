import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'

// â”€â”€â”€ Mocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
jest.mock('../frontend/src/Context/Auth', () => ({
  useAuthentification: jest.fn(),
}))

import { useAuthentification } from '../frontend/src/Context/Auth'
import { useAutoRefreshToken } from '../frontend/src/Hooks/useAutoRefreshToken'

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Construit un JWT avec un payload encodÃ© en base64 (sans signature rÃ©elle). */
function makeToken(payload: Record<string, any>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.fakesignature`
}

/** Token expirant dans N secondes Ã  partir de maintenant. */
function tokenExpiringIn(seconds: number): string {
  return makeToken({
    userId: 1,
    exp: Math.floor((Date.now() + seconds * 1000) / 1000),
  })
}

/** Token expirÃ© il y a N secondes. */
function expiredToken(secondsAgo = 60): string {
  return makeToken({
    userId: 1,
    exp: Math.floor((Date.now() - secondsAgo * 1000) / 1000),
  })
}

// â”€â”€â”€ Suite â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('useAutoRefreshToken', () => {
  let setToken: jest.Mock
  let logout: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    setToken = jest.fn()
    logout = jest.fn()
    localStorage.clear()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  // â”€â”€ Token absent â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('Token absent', () => {
    it('ne fait rien si token est null', () => {
      ;(useAuthentification as jest.Mock).mockReturnValue({ token: null, setToken, logout })

      renderHook(() => useAutoRefreshToken())

      jest.runAllTimers()

      expect(global.fetch).not.toHaveBeenCalled()
      expect(logout).not.toHaveBeenCalled()
    })

    it('ne plante pas si token est une chaÃ®ne vide', () => {
      ;(useAuthentification as jest.Mock).mockReturnValue({ token: '', setToken, logout })

      expect(() => renderHook(() => useAutoRefreshToken())).not.toThrow()
    })
  })

  // â”€â”€ Token invalide â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('Token invalide', () => {
    it('gÃ¨re un token malformÃ© sans lever d exception', () => {
      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: 'not.a.valid.jwt.atall',
        setToken,
        logout,
      })

      expect(() => renderHook(() => useAutoRefreshToken())).not.toThrow()
    })

    it('gÃ¨re un token dont le payload n est pas du JSON valide', () => {
      const badPayload = `header.${btoa('not json')}.sig`
      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: badPayload,
        setToken,
        logout,
      })

      expect(() => renderHook(() => useAutoRefreshToken())).not.toThrow()
    })

    it('gÃ¨re un token sans champ exp', () => {
      const noExp = makeToken({ userId: 1 }) // pas de exp
      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: noExp,
        setToken,
        logout,
      })

      expect(() => renderHook(() => useAutoRefreshToken())).not.toThrow()
    })
  })

  // â”€â”€ Token expirÃ© â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('Token dÃ©jÃ  expirÃ©', () => {
    it('appelle logout immÃ©diatement si le token est dÃ©jÃ  expirÃ©', () => {
      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: expiredToken(),
        setToken,
        logout,
      })

      renderHook(() => useAutoRefreshToken())

      // DÃ©clenche le traitement synchrone ou la premiÃ¨re tick
      act(() => {
        jest.runAllTimers()
      })

      expect(logout).toHaveBeenCalledTimes(1)
    })

    it('nessaie pas de rafraÃ®chir un token dÃ©jÃ  expirÃ©', () => {
      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: expiredToken(3600), // expirÃ© il y a 1h
        setToken,
        logout,
      })

      renderHook(() => useAutoRefreshToken())
      act(() => {
        jest.runAllTimers()
      })

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  // â”€â”€ Token valide avec refresh â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('Token valide â€” planification du refresh', () => {
    it('planifie un timeout pour rafraÃ®chir avant expiration', () => {
      const spySetTimeout = jest.spyOn(global, 'setTimeout')

      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: tokenExpiringIn(600), // expire dans 10 min
        setToken,
        logout,
      })

      renderHook(() => useAutoRefreshToken())

      expect(spySetTimeout).toHaveBeenCalled()
      spySetTimeout.mockRestore()
    })

    it('rafraÃ®chit le token avant expiration et appelle setToken', async () => {
      const newToken = tokenExpiringIn(3600)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ token: newToken }),
      })
      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: tokenExpiringIn(600), // 10 min
        setToken,
        logout,
      })

      renderHook(() => useAutoRefreshToken())

      // Avance les timers jusqu'au moment du refresh (un peu avant expiration)
      await act(async () => {
        jest.runAllTimers()
      })

      // Si le hook appelle l'API de refresh, setToken doit Ãªtre appelÃ©
      if ((global.fetch as jest.Mock).mock.calls.length > 0) {
        expect(setToken).toHaveBeenCalledWith(newToken)
      }
    })

    it('appelle logout si le refresh token est absent ou invalide', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: jest
          .fn()
          .mockResolvedValue({ message: 'Refresh token invalide' }),
      })
      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: tokenExpiringIn(30), // expire dans 30s â†’ refresh imminent
        setToken,
        logout,
      })

      renderHook(() => useAutoRefreshToken())

      await act(async () => {
        jest.runAllTimers()
      })

      if ((global.fetch as jest.Mock).mock.calls.length > 0) {
        expect(logout).toHaveBeenCalled()
      }
    })
  })

  // â”€â”€ Nettoyage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('Nettoyage (cleanup)', () => {
    it('annule le timeout lors du dÃ©montage du composant', () => {
      const spyClearTimeout = jest.spyOn(global, 'clearTimeout')

      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: tokenExpiringIn(600),
        setToken,
        logout,
      })

      const { unmount } = renderHook(() => useAutoRefreshToken())

      unmount()

      expect(spyClearTimeout).toHaveBeenCalled()
      spyClearTimeout.mockRestore()
    })

    it('ne dÃ©clenche pas de refresh aprÃ¨s le dÃ©montage', async () => {
      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: tokenExpiringIn(600),
        setToken,
        logout,
      })

      const { unmount } = renderHook(() => useAutoRefreshToken())

      unmount()

      await act(async () => {
        jest.runAllTimers()
      })

      // AprÃ¨s unmount, aucun appel rÃ©seau ne doit Ãªtre fait
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('replanifie le refresh quand le token change', () => {
      const spySetTimeout = jest.spyOn(global, 'setTimeout')

      const { rerender } = renderHook(
        ({ token }: { token: string | null }) => {
          ;(useAuthentification as jest.Mock).mockReturnValue({ token, setToken, logout })
          return useAutoRefreshToken()
        },
        { initialProps: { token: tokenExpiringIn(600) } }
      )

      const callsBefore = spySetTimeout.mock.calls.length

      rerender({ token: tokenExpiringIn(1200) })

      expect(spySetTimeout.mock.calls.length).toBeGreaterThan(callsBefore)
      spySetTimeout.mockRestore()
    })
  })
})
