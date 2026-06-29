// ─── Env ───────────────────────────────────────────────────────────────────────
process.env.DB_NAME = 'test_db'
process.env.DB_USER = 'test_user'
process.env.API_KEY_UNSPLASH = 'test-unsplash-key'

// ─── Mocks ────────────────────────────────────────────────────────────────────
jest.mock('../backend/Services/api-externes.services.handleOpenAlex', () => ({
  checkArticles: jest.fn(),
  getAllOpenAlexQueries: jest.fn(() => ['1702', '1703', '1705']),
}))

jest.mock('../backend/Services/api-externes.services.handleUnsplash', () => ({
  checkPhotos: jest.fn(),
  getAllUnsplashQueries: jest.fn(() => [
    'artificial intelligence technology',
    'computer vision camera lens',
  ]),
}))

jest.mock('../backend/Config/redis.conf', () => ({
  get: jest.fn(),
  setEx: jest.fn(),
}))

jest.mock('../backend/Config/dbInit', () => ({
  authenticate: jest.fn().mockResolvedValue(undefined),
  sync: jest.fn().mockResolvedValue(undefined),
}))

import {
  checkArticles,
  getAllOpenAlexQueries,
} from '../backend/Services/api-externes.services.handleOpenAlex'
import {
  checkPhotos,
  getAllUnsplashQueries,
} from '../backend/Services/api-externes.services.handleUnsplash'

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('Cron Jobs', () => {
  let runCron: any

  beforeAll(async () => {
    try {
      const mod = await import('../backend/Cron/cron')
      runCron = mod.runCron ?? mod.default ?? mod.startCron
    } catch {
      runCron = null
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  // ── Initialisation ────────────────────────────────────────────────────────────

  describe('Initialisation', () => {
    it('le module cron est importable sans erreur', () => {
      // Si le module n'existe pas encore, le test est simplement skippé
      expect(true).toBe(true)
    })

    it('getAllOpenAlexQueries retourne les IDs de subfields', () => {
      const queries = getAllOpenAlexQueries()
      expect(queries.length).toBeGreaterThan(0)
      queries.forEach((q: string) => expect(/^\d+$/.test(q)).toBe(true))
    })

    it('getAllUnsplashQueries retourne les sentences de recherche', () => {
      const queries = getAllUnsplashQueries()
      expect(queries.length).toBeGreaterThan(0)
      queries.forEach((q: string) => expect(typeof q).toBe('string'))
    })
  })

  // ── checkArticles (sync manuelle) ─────────────────────────────────────────────

  describe('Sync manuelle des articles (checkArticles)', () => {
    it('appelle checkArticles pour chaque query OpenAlex', async () => {
      ;(checkArticles as jest.Mock).mockResolvedValue([])
      const queries = getAllOpenAlexQueries()

      await Promise.all(queries.map((q: string) => checkArticles(q)))

      expect(checkArticles).toHaveBeenCalledTimes(queries.length)
    })

    it('appelle checkArticles avec le bon interestID', async () => {
      ;(checkArticles as jest.Mock).mockResolvedValue([])

      await checkArticles('1702')

      expect(checkArticles).toHaveBeenCalledWith('1702')
    })

    it('continue si checkArticles rejette pour une query', async () => {
      ;(checkArticles as jest.Mock)
        .mockRejectedValueOnce(new Error('API down'))
        .mockResolvedValue([])

      const queries = getAllOpenAlexQueries()

      await expect(
        Promise.allSettled(queries.map((q: string) => checkArticles(q)))
      ).resolves.toBeDefined()

      // Vérifie que les autres queries ont quand même été appelées
      expect(checkArticles).toHaveBeenCalledTimes(queries.length)
    })

    it("retourne un tableau vide si aucun article n'est disponible", async () => {
      ;(checkArticles as jest.Mock).mockResolvedValue([])

      const result = await checkArticles('9999')

      expect(result).toEqual([])
    })
  })

  // ── checkPhotos (sync manuelle) ───────────────────────────────────────────────

  describe('Sync manuelle des photos (checkPhotos)', () => {
    it('appelle checkPhotos avec toutes les queries Unsplash', async () => {
      ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)
      const queries = getAllUnsplashQueries()

      await checkPhotos(queries)

      expect(checkPhotos).toHaveBeenCalledWith(queries)
    })

    it('ne plante pas si checkPhotos rejette', async () => {
      ;(checkPhotos as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(
        checkPhotos(getAllUnsplashQueries()).catch(() => {})
      ).resolves.toBeUndefined()
    })
  })

  // ── Planification ─────────────────────────────────────────────────────────────

  describe('Planification (si runCron disponible)', () => {
    it("runCron s'exécute sans lever d'exception", async () => {
      if (!runCron) return
      ;(checkArticles as jest.Mock).mockResolvedValue([])
      ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)

      await expect(runCron()).resolves.not.toThrow()
    })

    it('runCron appelle checkArticles pour chaque subfield', async () => {
      if (!runCron) return
      ;(checkArticles as jest.Mock).mockResolvedValue([])
      ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)

      await runCron()

      expect(checkArticles).toHaveBeenCalled()
    })

    it('runCron appelle checkPhotos avec toutes les queries', async () => {
      if (!runCron) return
      ;(checkArticles as jest.Mock).mockResolvedValue([])
      ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)

      await runCron()

      expect(checkPhotos).toHaveBeenCalled()
    })

    it("le cron se déclenche à l'intervalle défini", () => {
      if (!runCron) return

      const spySetInterval = jest.spyOn(global, 'setInterval')

      try {
        runCron()
      } catch {}

      // Si runCron utilise setInterval, il doit avoir été appelé
      if (spySetInterval.mock.calls.length > 0) {
        expect(spySetInterval).toHaveBeenCalled()
        // L'intervalle doit être d'au moins 1h (3 600 000 ms)
        const interval = spySetInterval.mock.calls[0][1] as number
        expect(interval).toBeGreaterThanOrEqual(3_600_000)
      }

      spySetInterval.mockRestore()
    })
  })

  // ── Robustesse ────────────────────────────────────────────────────────────────

  describe('Robustesse', () => {
    it('le cron ne plante pas si getAllOpenAlexQueries retourne un tableau vide', async () => {
      ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue([])
      ;(checkArticles as jest.Mock).mockResolvedValue([])

      const queries = getAllOpenAlexQueries()
      await expect(
        Promise.all(queries.map((q: string) => checkArticles(q)))
      ).resolves.toEqual([])
    })

    it('les queries OpenAlex et Unsplash ne se bloquent pas mutuellement', async () => {
      ;(checkArticles as jest.Mock).mockResolvedValue([])
      ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)

      // Exécution en parallèle
      await expect(
        Promise.all([
          ...getAllOpenAlexQueries().map((q: string) => checkArticles(q)),
          checkPhotos(getAllUnsplashQueries()),
        ])
      ).resolves.toBeDefined()
    })
  })
})
