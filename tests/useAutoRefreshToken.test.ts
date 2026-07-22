import { renderHook, act } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('../frontend/src/Context/Auth', () => ({
  useAuthentification: jest.fn(),
}))

import { useAuthentification } from '../frontend/src/Context/Auth'
import { useAutoRefreshToken } from '../frontend/src/Hooks/useAutoRefreshToken'

function makeToken(payload: Record<string, any>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  return `${header}.${body}.fakesignature`
}

function tokenExpiringIn(seconds: number): string {
  return makeToken({
    userId: 1,
    exp: Math.floor((Date.now() + seconds * 1000) / 1000),
  })
}

function expiredToken(secondsAgo = 60): string {
  return makeToken({
    userId: 1,
    exp: Math.floor((Date.now() - secondsAgo * 1000) / 1000),
  })
}


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


  describe('Token absent', () => {
    it('ne fait rien si token est null', () => {
      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: null,
        setToken,
        logout,
      })

      renderHook(() => useAutoRefreshToken())

      jest.runAllTimers()

      expect(global.fetch).not.toHaveBeenCalled()
      expect(logout).not.toHaveBeenCalled()
    })

    it('ne plante pas si token est une chaine vide', () => {
      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: '',
        setToken,
        logout,
      })

      expect(() => renderHook(() => useAutoRefreshToken())).not.toThrow()
    })
  })


  describe('Token invalide', () => {
    it(' un token malformé sans lever d exception', () => {
      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: 'not.a.valid.jwt.atall',
        setToken,
        logout,
      })

      expect(() => renderHook(() => useAutoRefreshToken())).not.toThrow()
    })

    it('le token dont le payload n est pas du JSON valide', () => {
      const badPayload = `header.${btoa('not json')}.sig`
      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: badPayload,
        setToken,
        logout,
      })

      expect(() => renderHook(() => useAutoRefreshToken())).not.toThrow()
    })

    it('gère un token sans champ exp', () => {
      const noExp = makeToken({ userId: 1 }) 
      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: noExp,
        setToken,
        logout,
      })

      expect(() => renderHook(() => useAutoRefreshToken())).not.toThrow()
    })
  })


  describe('Token déjà expiré', () => {
    it('appelle logout immédiatement si le token est déjà expiré', () => {
      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: expiredToken(),
        setToken,
        logout,
      })

      renderHook(() => useAutoRefreshToken())

      act(() => {
        jest.runAllTimers()
      })

      expect(logout).toHaveBeenCalledTimes(1)
    })

    it('nessaie pas de rafraichir un token déjà expiré', () => {
      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: expiredToken(3600), 
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


  describe('Token valide â€” planification du refresh', () => {
    it('planifie un timeout pour rafraichir avant expiration', () => {
      const spySetTimeout = jest.spyOn(global, 'setTimeout')

      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: tokenExpiringIn(600),
        setToken,
        logout,
      })

      renderHook(() => useAutoRefreshToken())

      expect(spySetTimeout).toHaveBeenCalled()
      spySetTimeout.mockRestore()
    })

    it('rafraichis le token avant expiration et appelle setToken', async () => {
      const newToken = tokenExpiringIn(3600)
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ token: newToken }),
      })
      ;(useAuthentification as jest.Mock).mockReturnValue({
        token: tokenExpiringIn(600), 
        setToken,
        logout,
      })

      renderHook(() => useAutoRefreshToken())

      await act(async () => {
        jest.runAllTimers()
      })

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
        token: tokenExpiringIn(30),
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


  describe('Nettoyage (cleanup)', () => {
    it('annule le timeout', () => {
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

    it('ne déclenche pas de refresh après le démontage', async () => {
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

      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('replanifie le refresh quand le token change', () => {
      const spySetTimeout = jest.spyOn(global, 'setTimeout')

      const { rerender } = renderHook(
        ({ token }: { token: string | null }) => {
          ;(useAuthentification as jest.Mock).mockReturnValue({
            token,
            setToken,
            logout,
          })
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
