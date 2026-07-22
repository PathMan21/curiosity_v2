process.env.DB_NAME = 'test_db'
process.env.DB_USER = 'test_user'

const mockCronScheduleCalls: any[] = []

jest.mock('node-cron', () => ({
  schedule: jest.fn((expr: string, t: () => Promise<void>) => {
    mockCronScheduleCalls.push([expr, t])
    return { start: jest.fn(), stop: jest.fn(), destroy: jest.fn() }
  }),
}))

jest.mock('../backend/Services/api-externes.services.handleOpenAlex', () => ({
  checkArticles: jest.fn(),
  getAllOpenAlexQueries: jest.fn(),
}))

import { task } from '../backend/Helpers/cron.schedules.Articles'
import cron from 'node-cron'
import {
  checkArticles,
  getAllOpenAlexQueries,
} from '../backend/Services/api-externes.services.handleOpenAlex'

describe('cron.schedules.Articles', () => {
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
    it('appelle getAllOpenAlexQueries au démarrage', async () => {
      ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue(['1702'])
      ;(checkArticles as jest.Mock).mockResolvedValue([])

      await task()

      expect(getAllOpenAlexQueries).toHaveBeenCalledTimes(1)
    })

    it('appelle checkArticles pour chaque query', async () => {
      ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue([
        '1702',
        '1703',
        '1705',
      ])
      ;(checkArticles as jest.Mock).mockResolvedValue([])

      await task()

      expect(checkArticles).toHaveBeenCalledTimes(3)
      expect(checkArticles).toHaveBeenCalledWith('1702')
      expect(checkArticles).toHaveBeenCalledWith('1703')
      expect(checkArticles).toHaveBeenCalledWith('1705')
    })

    it("respecte l'ordre séquentiel des queries", async () => {
      const order: string[] = []
      ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue([
        '1702',
        '1703',
        '1705',
      ])
      ;(checkArticles as jest.Mock).mockImplementation(async (q: string) => {
        order.push(q)
      })

      await task()

      expect(order).toEqual(['1702', '1703', '1705'])
    })

    it('attend 200ms entre chaque query (anti-rate-limit)', async () => {
      ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue(['1702', '1703'])
      ;(checkArticles as jest.Mock).mockResolvedValue([])

      const setTimeoutSpy = jest.spyOn(global, 'setTimeout')

      await task()

      const delays = setTimeoutSpy.mock.calls.map(([, ms]) => ms)
      expect(delays.every((ms) => ms === 200)).toBe(true)
      expect(delays).toHaveLength(2)
    })

    it('ne fait rien si getAllOpenAlexQueries retourne un tableau vide', async () => {
      ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue([])

      await task()

      expect(checkArticles).not.toHaveBeenCalled()
    })

    it("log le début et la fin de l'exécution", async () => {
      ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue(['1702'])
      ;(checkArticles as jest.Mock).mockResolvedValue([])

      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      await task()

      const messages = logSpy.mock.calls.map(([msg]) => msg as string)
      expect(messages.some((m) => m.includes('CRON START'))).toBe(true)
      expect(messages.some((m) => m.includes('CRON DONE'))).toBe(true)
    })
  })

  describe('Protection isCronRunning', () => {
    it("ne s'exécute pas en parallèle", async () => {
      ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue(['1702'])
      let resolveArticles: any
      ;(checkArticles as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveArticles = resolve
          })
      )

      const p1 = task()
      const p2 = task()
      resolveArticles()
      await Promise.all([p1, p2])

      expect(checkArticles).toHaveBeenCalledTimes(1)
    })

    it('remet isCronRunning à false après succès', async () => {
      ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue(['1702'])
      ;(checkArticles as jest.Mock).mockResolvedValue([])

      await task()
      await task()

      expect(checkArticles).toHaveBeenCalledTimes(2)
    })

    it('remet isCronRunning à false après une erreur (finally)', async () => {
      ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue(['1702'])
      ;(checkArticles as jest.Mock).mockRejectedValue(new Error('API down'))

      await task()
      ;(checkArticles as jest.Mock).mockResolvedValue([])
      await task()

      expect(checkArticles).toHaveBeenCalledTimes(2)
    })
  })

  describe('Gestion des erreurs', () => {
    it("ne lève pas d'exception si checkArticles rejette", async () => {
      ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue(['1702'])
      ;(checkArticles as jest.Mock).mockRejectedValue(
        new Error('Network error')
      )

      await expect(task()).resolves.not.toThrow()
    })

    it("ne lève pas d'exception si getAllOpenAlexQueries lève une erreur", async () => {
      ;(getAllOpenAlexQueries as jest.Mock).mockImplementation(() => {
        throw new Error('Service unavailable')
      })

      await expect(task()).resolves.not.toThrow()
    })

    it("log l'erreur avec console.error", async () => {
      ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue(['1702'])
      ;(checkArticles as jest.Mock).mockRejectedValue(new Error('Crash'))

      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      await task()

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('CRON ERROR'),
        expect.any(Error)
      )
    })
  })
})
