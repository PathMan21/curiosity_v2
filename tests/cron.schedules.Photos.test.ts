process.env.DB_NAME = 'test_db'
process.env.DB_USER = 'test_user'

const mockCronScheduleCalls: any[] = []

jest.mock('node-cron', () => ({
  schedule: jest.fn((expr: string, t: () => Promise<void>) => {
    mockCronScheduleCalls.push([expr, t])
    return { start: jest.fn(), stop: jest.fn(), destroy: jest.fn() }
  }),
}))

jest.mock('../backend/Services/api-externes.services.handleUnsplash', () => ({
  checkPhotos: jest.fn(),
  getAllUnsplashQueries: jest.fn(),
}))

import { task } from '../backend/Helpers/cron.schedules.Photos'
import cron from 'node-cron'
import {
  checkPhotos,
  getAllUnsplashQueries,
} from '../backend/Services/api-externes.services.handleUnsplash'

describe('cron.schedules.Photos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(global, 'setTimeout').mockImplementation((cb: any) => {
      cb()
      return 0 as any
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Planification', () => {
    it('planifie le cron avec l\'expression "0 2 * * *"', () => {
      const hasCall = mockCronScheduleCalls.some(
        ([expr]) => expr === '0 2 * * *'
      )
      expect(hasCall).toBe(true)
    })

    it('task est bien une fonction exportée', () => {
      expect(typeof task).toBe('function')
    })
  })

  describe('Exécution normale', () => {
    it('appelle getAllUnsplashQueries au démarrage', async () => {
      ;(getAllUnsplashQueries as jest.Mock).mockReturnValue([
        'artificial intelligence technology',
      ])
      ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)

      await task()

      expect(getAllUnsplashQueries).toHaveBeenCalledTimes(1)
    })

    it('passe toutes les queries à checkPhotos en un seul appel', async () => {
      const queries = [
        'artificial intelligence technology',
        'robot automation machine',
        'quantum physics laboratory',
      ]
      ;(getAllUnsplashQueries as jest.Mock).mockReturnValue(queries)
      ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)

      await task()

      expect(checkPhotos).toHaveBeenCalledTimes(1)
      expect(checkPhotos).toHaveBeenCalledWith(queries)
    })

    it('fonctionne si getAllUnsplashQueries retourne un tableau vide', async () => {
      ;(getAllUnsplashQueries as jest.Mock).mockReturnValue([])
      ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)

      await task()

      expect(checkPhotos).toHaveBeenCalledWith([])
    })

    it("log le début de l'exécution", async () => {
      ;(getAllUnsplashQueries as jest.Mock).mockReturnValue(['ai technology'])
      ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)

      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      await task()

      const messages = logSpy.mock.calls.map(([msg]) => msg as string)
      expect(messages.some((m) => m.includes('CRON PHOTO'))).toBe(true)
    })

    it("log la durée d'exécution en cas de succès", async () => {
      ;(getAllUnsplashQueries as jest.Mock).mockReturnValue(['ai technology'])
      ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)

      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      await task()

      const messages = logSpy.mock.calls.map(([msg]) => msg as string)
      expect(messages.some((m) => m.includes('FINI'))).toBe(true)
    })
  })

  describe('Protection isCronRunning', () => {
    it("ne s'exécute pas en parallèle", async () => {
      ;(getAllUnsplashQueries as jest.Mock).mockReturnValue(['ai technology'])
      let resolvePhoto: any
      ;(checkPhotos as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePhoto = resolve
          })
      )

      const p1 = task()
      const p2 = task()
      resolvePhoto()
      await Promise.all([p1, p2])

      expect(checkPhotos).toHaveBeenCalledTimes(1)
    })

    it('affiche un warning CRON PHOTO si déjà en cours', async () => {
      ;(getAllUnsplashQueries as jest.Mock).mockReturnValue(['ai technology'])
      let resolvePhoto: any
      ;(checkPhotos as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePhoto = resolve
          })
      )

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

      const p1 = task()
      await task()

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('TOUJOURS EN EXECUTION')
      )

      resolvePhoto()
      await p1
    })

    it('remet isCronRunning à false après succès', async () => {
      ;(getAllUnsplashQueries as jest.Mock).mockReturnValue(['ai technology'])
      ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)

      await task()
      await task()

      expect(checkPhotos).toHaveBeenCalledTimes(2)
    })

    it('remet isCronRunning à false après une erreur (finally)', async () => {
      ;(getAllUnsplashQueries as jest.Mock).mockReturnValue(['ai technology'])
      ;(checkPhotos as jest.Mock).mockRejectedValue(new Error('Unsplash down'))

      await task()
      ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)
      await task()

      expect(checkPhotos).toHaveBeenCalledTimes(2)
    })
  })

  describe('Gestion des erreurs', () => {
    it("ne lève pas d'exception si checkPhotos rejette", async () => {
      ;(getAllUnsplashQueries as jest.Mock).mockReturnValue(['ai technology'])
      ;(checkPhotos as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(task()).resolves.not.toThrow()
    })

    it("ne lève pas d'exception si getAllUnsplashQueries lève une erreur", async () => {
      ;(getAllUnsplashQueries as jest.Mock).mockImplementation(() => {
        throw new Error('Service unavailable')
      })

      await expect(task()).resolves.not.toThrow()
    })

    it("log l'erreur avec console.error et la durée", async () => {
      ;(getAllUnsplashQueries as jest.Mock).mockReturnValue(['ai technology'])
      ;(checkPhotos as jest.Mock).mockRejectedValue(new Error('Crash'))

      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      await task()

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('ERREUR'),
        expect.any(Error)
      )
    })
  })
})
