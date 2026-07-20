process.env.DB_NAME = 'test_db'
process.env.DB_USER = 'test_user'

jest.mock('node-cron', () => {
  const calls: any[] = []
  ;(global as any).mockCronScheduleCalls = calls
  return {
    schedule: jest.fn((expr: string, t: () => Promise<void>) => {
      calls.push([expr, t])
      return { start: jest.fn(), stop: jest.fn(), destroy: jest.fn() }
    }),
  }
})

jest.mock('../backend/Services/api-externes.services.handleOpenAlex', () => ({
  checkArticles: jest.fn(),
  getAllOpenAlexQueries: jest.fn(),
}))

jest.mock('../backend/Services/api-externes.services.handleUnsplash', () => ({
  checkPhotos: jest.fn(),
  getAllUnsplashQueries: jest.fn(),
}))

import {
  checkArticles,
  getAllOpenAlexQueries,
} from '../backend/Services/api-externes.services.handleOpenAlex'
import {
  checkPhotos,
  getAllUnsplashQueries,
} from '../backend/Services/api-externes.services.handleUnsplash'
import { task as articlesTask } from '../backend/Helpers/cron.schedules.Articles'
import { task as photosTask } from '../backend/Helpers/cron.schedules.Photos'

describe('cron.schedules.Articles', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock global setTimeout to execute callback immediately
    jest.spyOn(global, 'setTimeout').mockImplementation((cb: any) => {
      cb()
      return 0 as any
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('planifie le cron avec l\'expression "0 2 * * *"', () => {
    const calls = (global as any).mockCronScheduleCalls || []
    const hasCall = calls.some(([expr]: any) => expr === '0 2 * * *')
    expect(hasCall).toBe(true)
  })

  it('appelle getAllOpenAlexQueries au démarrage de la tâche', async () => {
    ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue(['1702', '1703'])
    ;(checkArticles as jest.Mock).mockResolvedValue([])

    await articlesTask()

    expect(getAllOpenAlexQueries).toHaveBeenCalledTimes(1)
  })

  it('appelle checkArticles pour chaque query retournée', async () => {
    ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue([
      '1702',
      '1703',
      '1705',
    ])
    ;(checkArticles as jest.Mock).mockResolvedValue([])

    await articlesTask()

    expect(checkArticles).toHaveBeenCalledTimes(3)
    expect(checkArticles).toHaveBeenCalledWith('1702')
    expect(checkArticles).toHaveBeenCalledWith('1703')
    expect(checkArticles).toHaveBeenCalledWith('1705')
  })

  it("respecte l'ordre des queries (séquentiel, pas parallèle)", async () => {
    const order: string[] = []
    ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue(['1702', '1703'])
    ;(checkArticles as jest.Mock).mockImplementation(async (q: string) => {
      order.push(q)
    })

    await articlesTask()

    expect(order).toEqual(['1702', '1703'])
  })

  it('attend 200ms entre chaque query (délai anti-rate-limit)', async () => {
    ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue(['1702', '1703'])
    ;(checkArticles as jest.Mock).mockResolvedValue([])

    const setTimeoutSpy = jest.spyOn(global, 'setTimeout')

    await articlesTask()

    const delays = setTimeoutSpy.mock.calls.map(([, ms]) => ms)
    expect(delays.every((ms) => ms === 200)).toBe(true)
    expect(delays.length).toBe(2)
  })

  it("ne s'exécute pas en parallèle si isCronRunning est true", async () => {
    ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue(['1702'])
    let resolveArticles: any
    ;(checkArticles as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveArticles = resolve
        })
    )

    const p1 = articlesTask()
    const p2 = articlesTask()
    resolveArticles()
    await Promise.all([p1, p2])

    expect(checkArticles).toHaveBeenCalledTimes(1)
  })

  it('remet isCronRunning à false après une exécution réussie', async () => {
    ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue(['1702'])
    ;(checkArticles as jest.Mock).mockResolvedValue([])

    await articlesTask()
    await articlesTask()

    expect(checkArticles).toHaveBeenCalledTimes(2)
  })

  it('remet isCronRunning à false même si checkArticles lève une erreur', async () => {
    ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue(['1702'])
    ;(checkArticles as jest.Mock).mockRejectedValue(new Error('API down'))

    await articlesTask()
    ;(checkArticles as jest.Mock).mockResolvedValue([])
    await articlesTask()

    expect(checkArticles).toHaveBeenCalledTimes(2)
  })

  it("ne lève pas d'exception si checkArticles rejette", async () => {
    ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue(['1702'])
    ;(checkArticles as jest.Mock).mockRejectedValue(new Error('Network error'))

    await expect(articlesTask()).resolves.not.toThrow()
  })

  it("ne lève pas d'exception si getAllOpenAlexQueries retourne un tableau vide", async () => {
    ;(getAllOpenAlexQueries as jest.Mock).mockReturnValue([])

    await expect(articlesTask()).resolves.not.toThrow()
    expect(checkArticles).not.toHaveBeenCalled()
  })
})

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

  it('planifie le cron avec l\'expression "0 2 * * *"', () => {
    const calls = (global as any).mockCronScheduleCalls || []
    const hasCall = calls.some(([expr]: any) => expr === '0 2 * * *')
    expect(hasCall).toBe(true)
  })

  it('appelle getAllUnsplashQueries au démarrage de la tâche', async () => {
    ;(getAllUnsplashQueries as jest.Mock).mockReturnValue([
      'artificial intelligence technology',
    ])
    ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)

    await photosTask()

    expect(getAllUnsplashQueries).toHaveBeenCalledTimes(1)
  })

  it('passe toutes les queries à checkPhotos en un seul appel', async () => {
    const queries = [
      'artificial intelligence technology',
      'robot automation machine',
    ]
    ;(getAllUnsplashQueries as jest.Mock).mockReturnValue(queries)
    ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)

    await photosTask()

    expect(checkPhotos).toHaveBeenCalledTimes(1)
    expect(checkPhotos).toHaveBeenCalledWith(queries)
  })

  it("ne s'exécute pas en parallèle si isCronRunning est true", async () => {
    ;(getAllUnsplashQueries as jest.Mock).mockReturnValue(['ai technology'])
    let resolvePhoto: any
    ;(checkPhotos as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePhoto = resolve
        })
    )

    const p1 = photosTask()
    const p2 = photosTask()
    resolvePhoto()
    await Promise.all([p1, p2])

    expect(checkPhotos).toHaveBeenCalledTimes(1)
  })

  it('remet isCronRunning à false après une exécution réussie', async () => {
    ;(getAllUnsplashQueries as jest.Mock).mockReturnValue(['ai technology'])
    ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)

    await photosTask()
    await photosTask()

    expect(checkPhotos).toHaveBeenCalledTimes(2)
  })

  it('remet isCronRunning à false même si checkPhotos lève une erreur', async () => {
    ;(getAllUnsplashQueries as jest.Mock).mockReturnValue(['ai technology'])
    ;(checkPhotos as jest.Mock).mockRejectedValue(new Error('Unsplash down'))

    await photosTask()
    ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)
    await photosTask()

    expect(checkPhotos).toHaveBeenCalledTimes(2)
  })

  it("ne lève pas d'exception si checkPhotos rejette", async () => {
    ;(getAllUnsplashQueries as jest.Mock).mockReturnValue(['ai technology'])
    ;(checkPhotos as jest.Mock).mockRejectedValue(new Error('Network error'))

    await expect(photosTask()).resolves.not.toThrow()
  })

  it("ne lève pas d'exception si getAllUnsplashQueries retourne un tableau vide", async () => {
    ;(getAllUnsplashQueries as jest.Mock).mockReturnValue([])
    ;(checkPhotos as jest.Mock).mockResolvedValue(undefined)

    await expect(photosTask()).resolves.not.toThrow()
    expect(checkPhotos).toHaveBeenCalledWith([])
  })

  it('affiche un warning si le cron est déjà en cours', async () => {
    ;(getAllUnsplashQueries as jest.Mock).mockReturnValue(['ai technology'])
    ;(checkPhotos as jest.Mock).mockImplementation(() => new Promise(() => {}))

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    const p1 = photosTask()
    await photosTask()

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('TOUJOURS EN EXECUTION')
    )

    warnSpy.mockRestore()
    p1.catch(() => {})
  })
})
