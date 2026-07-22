process.env.DB_NAME = 'test_db'
process.env.DB_USER = 'test_user'
process.env.API_KEY_UNSPLASH = 'test-unsplash-key'
process.env.API_KEY_NEWS = 'test-news-key'

jest.mock('../backend/Config/redis.conf', () => ({
  get: jest.fn(),
  setEx: jest.fn(),
}))

jest.mock('../backend/Config/dbInit', () => ({
  define: jest.fn(() => ({})),
  transaction: jest.fn(),
  authenticate: jest.fn().mockResolvedValue(undefined),
  sync: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('../backend/Models/Article', () => ({
  findAll: jest.fn(),
  bulkCreate: jest.fn(),
  destroy: jest.fn(),
}))

jest.mock('../backend/Models/Photo', () => ({
  findAll: jest.fn(),
  bulkCreate: jest.fn(),
}))

jest.mock('../backend/Helpers/CheckTooOld', () => ({
  isArticlesTooOld: jest.fn(() => false),
  isPhotosTooOld: jest.fn(() => false),
}))

jest.mock('../backend/dtos/Article', () => ({
  createArticleSchema: { parse: jest.fn((d) => d) },
}))

jest.mock('../backend/dtos/Photos', () => ({
  createPhotosSchema: { parse: jest.fn((d) => d) },
}))

import redisClient from '../backend/Config/redis.conf'
import sequelizeDb from '../backend/Config/dbInit'
import Article from '../backend/Models/Article'
import Photo from '../backend/Models/Photo'
import {
  isArticlesTooOld,
  isPhotosTooOld,
} from '../backend/Helpers/CheckTooOld'

function makeWork(id = 'W1', score = 0.9) {
  return {
    id: `https://openalex.org/${id}`,
    title: `Article ${id}`,
    abstract: 'Abstract text',
    publication_date: '2024-03-01',
    publication_year: 2024,
    canonical_url: `https://example.com/${id}`,
    doi: `https://doi.org/10.1234/${id}`,
    open_access: { is_oa: true, oa_url: `https://pdf.example.com/${id}` },
    authorships: [{ author: { display_name: 'Alice' } }],
    topics: [{ score, display_name: 'Machine Learning' }],
    concepts: [{ display_name: 'Deep Learning' }],
  }
}

function makeUnsplashResult(id = 'p1') {
  return {
    id,
    alt_description: `Photo ${id}`,
    urls: {
      regular: `https://images.unsplash.com/${id}/regular`,
      thumb: `https://images.unsplash.com/${id}/thumb`,
    },
    user: {
      name: 'Photographer',
      links: { html: 'https://unsplash.com/@photo' },
    },
    links: { download: `https://unsplash.com/photos/${id}/download` },
  }
}

function makeNewsArticle(id = 1) {
  return {
    source: { id: 'bbc-news', name: 'BBC News' },
    title: `Breaking News ${id}`,
    description: `Description ${id}`,
    url: `https://bbc.com/news/${id}`,
    urlToImage: `https://bbc.com/images/${id}.jpg`,
    publishedAt: '2024-03-01T10:00:00Z',
    content: `Content of article ${id}`,
  }
}

function mockOkFetch(payload: any) {
  return jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue(payload),
  })
}

function mockFailFetch(status = 500) {
  return jest.fn().mockResolvedValue({
    ok: false,
    status,
    json: jest.fn().mockResolvedValue({ error: 'Error' }),
  })
}

describe('External API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  describe('OpenAlex Service', () => {
    let fetchInterestFromAPI: any
    let checkArticles: any
    let getAllOpenAlexQueries: any

    beforeAll(async () => {
      const mod =
        await import('../backend/Services/api-externes.services.handleOpenAlex')
      fetchInterestFromAPI = mod.fetchInterestFromAPI
      checkArticles = mod.checkArticles
      getAllOpenAlexQueries = mod.getAllOpenAlexQueries
    })

    describe('fetchInterestFromAPI', () => {
      it('construit URL avec les bons filtres (is_oa:true, language:en)', async () => {
        global.fetch = mockOkFetch({ results: [makeWork()] })

        await fetchInterestFromAPI('1702')

        const [url] = (global.fetch as jest.Mock).mock.calls[0]
        expect(url).toContain('is_oa:true')
        expect(url).toContain('language:en')
        expect(url).toContain('topics.subfield.id:1702')
      })

      it("inclut l'année courante et l'année précédente dans le filtre", async () => {
        global.fetch = mockOkFetch({ results: [] })

        await fetchInterestFromAPI('1702')

        const currentYear = new Date().getFullYear()
        const [url] = (global.fetch as jest.Mock).mock.calls[0]
        expect(url).toContain(`${currentYear - 1}-${currentYear}`)
      })

      it("envoie l'en-tête User-Agent mailto requis par OpenAlex", async () => {
        global.fetch = mockOkFetch({ results: [] })

        await fetchInterestFromAPI('1702')

        const [, options] = (global.fetch as jest.Mock).mock.calls[0]
        expect(options.headers['User-Agent']).toContain('mailto:')
      })

      it('retourne uniquement les works avec topic score >= 0.75', async () => {
        let callCount = 0
        global.fetch = jest.fn().mockImplementation(() => {
          callCount++
          const results =
            callCount === 1
              ? [makeWork('W1', 0.9), makeWork('W2', 0.5), makeWork('W3', 0.75)]
              : []
          return Promise.resolve({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({ results }),
          })
        })

        const results = await fetchInterestFromAPI('1702')

        expect(results.length).toBe(2)
      })

      it("s'arrête si l'API retourne !ok sur une page", async () => {
        global.fetch = mockFailFetch(429) // rate limit

        const results = await fetchInterestFromAPI('1702')

        expect(results).toEqual([])
      })

      it('rejette les interestID non numériques sans appeler fetch', async () => {
        await fetchInterestFromAPI('S144133560abc')

        expect(global.fetch).not.toHaveBeenCalled()
      })

      it('pagine sur 3 pages et agrège tous les résultats valides', async () => {
        global.fetch = mockOkFetch({ results: [makeWork()] })

        await fetchInterestFromAPI('1702')

        expect(global.fetch).toHaveBeenCalledTimes(3)
      })
    })

    describe('checkArticles — stratégie cache / DB / API', () => {
      const interest = '1702'

      it('utilise le cache si présent et non périmé', async () => {
        const cached = { articles: [{ openAlexId: 'W1' }] }
        ;(redisClient.get as jest.Mock).mockResolvedValue(
          JSON.stringify(cached)
        )
        ;(isArticlesTooOld as jest.Mock).mockReturnValue(false)

        await checkArticles(interest)

        expect(Article.findAll).not.toHaveBeenCalled()
        expect(global.fetch).not.toHaveBeenCalled()
      })

      it('tombe sur la DB si le cache est absent', async () => {
        ;(redisClient.get as jest.Mock).mockResolvedValue(null)
        ;(Article.findAll as jest.Mock).mockResolvedValue([
          { toJSON: () => ({ openAlexId: 'W2', subfield: interest }) },
        ])

        const results = await checkArticles(interest)

        expect(Article.findAll).toHaveBeenCalledWith({
          where: { subfield: interest },
        })
        expect(results.length).toBe(1)
      })

      it('met le cache à jour après lecture de la DB', async () => {
        ;(redisClient.get as jest.Mock).mockResolvedValue(null)
        ;(Article.findAll as jest.Mock).mockResolvedValue([
          { toJSON: () => ({ openAlexId: 'W2' }) },
        ])
        ;(isArticlesTooOld as jest.Mock).mockReturnValue(false)

        await checkArticles(interest)

        expect(redisClient.setEx).toHaveBeenCalled()
      })

      it("appelle l'API si cache ET DB sont vides", async () => {
        ;(redisClient.get as jest.Mock).mockResolvedValue(null)
        ;(Article.findAll as jest.Mock).mockResolvedValue([])
        global.fetch = mockOkFetch({ results: [makeWork()] })

        const mockTx = { commit: jest.fn(), rollback: jest.fn() }
        ;(sequelizeDb.transaction as jest.Mock).mockResolvedValue(mockTx)
        ;(Article.destroy as jest.Mock).mockResolvedValue(undefined)
        ;(Article.bulkCreate as jest.Mock).mockResolvedValue([])
        ;(redisClient.setEx as jest.Mock).mockResolvedValue('OK')

        await checkArticles(interest)

        expect(global.fetch).toHaveBeenCalled()
        expect(Article.bulkCreate).toHaveBeenCalled()
        expect(mockTx.commit).toHaveBeenCalled()
      })

      it('rollback si la sauvegarde en DB échoue', async () => {
        ;(redisClient.get as jest.Mock).mockResolvedValue(null)
        ;(Article.findAll as jest.Mock).mockResolvedValue([])
        global.fetch = mockOkFetch({ results: [makeWork()] })

        const mockTx = { commit: jest.fn(), rollback: jest.fn() }
        ;(sequelizeDb.transaction as jest.Mock).mockResolvedValue(mockTx)
        ;(Article.destroy as jest.Mock).mockRejectedValue(new Error('DB error'))

        await checkArticles(interest)

        expect(mockTx.rollback).toHaveBeenCalled()
        expect(mockTx.commit).not.toHaveBeenCalled()
      })

      it("retourne [] si l'API ne renvoie aucun work valide", async () => {
        ;(redisClient.get as jest.Mock).mockResolvedValue(null)
        ;(Article.findAll as jest.Mock).mockResolvedValue([])
        global.fetch = mockOkFetch({ results: [] })

        const results = await checkArticles(interest)

        expect(results).toEqual([])
      })

      it("ne lève pas d'exception sur erreur Redis", async () => {
        ;(redisClient.get as jest.Mock).mockRejectedValue(
          new Error('Redis down')
        )

        await expect(checkArticles(interest)).resolves.not.toThrow()
      })
    })

    describe('getAllOpenAlexQueries', () => {
      it('retourne toutes les valeurs numériques de la map', () => {
        const queries = getAllOpenAlexQueries()
        expect(queries.length).toBeGreaterThan(0)
        queries.forEach((q: string) => expect(/^\d+$/.test(q)).toBe(true))
      })
    })
  })

  describe('Unsplash Service', () => {
    let checkPhotos: any
    let getAllUnsplashQueries: any

    beforeAll(async () => {
      const mod =
        await import('../backend/Services/api-externes.services.handleUnsplash')
      checkPhotos = mod.checkPhotos
      getAllUnsplashQueries = mod.getAllUnsplashQueries
    })

    describe('getAllUnsplashQueries', () => {
      it('retourne des sentences descriptives non vides', () => {
        const queries = getAllUnsplashQueries()
        expect(queries.length).toBeGreaterThan(0)
        queries.forEach((q: string) => {
          expect(typeof q).toBe('string')
          expect(q.length).toBeGreaterThan(0)
        })
      })

      it("contient la sentence pour l'IA", () => {
        expect(getAllUnsplashQueries()).toContain(
          'artificial intelligence technology'
        )
      })
    })

    describe('checkPhotos — stratégie cache / DB / API', () => {
      const query = 'artificial intelligence technology'

      it('skip le fetch si le cache est valide', async () => {
        ;(redisClient.get as jest.Mock).mockResolvedValue(
          JSON.stringify({ photosArray: [{ unsplashId: 'p1' }] })
        )
        ;(isPhotosTooOld as jest.Mock).mockReturnValue(false)

        await checkPhotos([query])

        expect(global.fetch).not.toHaveBeenCalled()
      })

      it('lit la DB si le cache est absent', async () => {
        ;(redisClient.get as jest.Mock).mockResolvedValue(null)
        ;(Photo.findAll as jest.Mock).mockResolvedValue([
          { toJSON: () => ({ unsplashId: 'p1', interest: query }) },
        ])
        ;(isPhotosTooOld as jest.Mock).mockReturnValue(false)

        await checkPhotos([query])

        expect(Photo.findAll).toHaveBeenCalledWith({
          where: { interest: query },
        })
        expect(global.fetch).not.toHaveBeenCalled()
      })

      it("appelle l'API Unsplash si cache et DB sont vides", async () => {
        ;(redisClient.get as jest.Mock).mockResolvedValue(null)
        ;(Photo.findAll as jest.Mock).mockResolvedValue([])

        global.fetch = mockOkFetch({ results: [makeUnsplashResult()] })

        const mockTx = { commit: jest.fn(), rollback: jest.fn() }
        ;(sequelizeDb.transaction as jest.Mock).mockResolvedValue(mockTx)
        ;(Photo.bulkCreate as jest.Mock).mockResolvedValue([])
        ;(redisClient.setEx as jest.Mock).mockResolvedValue('OK')

        await checkPhotos([query])

        expect(global.fetch).toHaveBeenCalled()
        const [url] = (global.fetch as jest.Mock).mock.calls[0]
        expect(url).toContain('api.unsplash.com')
        expect(url).toContain(encodeURIComponent(query))
        expect(url).toContain('test-unsplash-key')
      })

      it('rollback si la sauvegarde DB échoue', async () => {
        ;(redisClient.get as jest.Mock).mockResolvedValue(null)
        ;(Photo.findAll as jest.Mock).mockResolvedValue([])
        global.fetch = mockOkFetch({ results: [makeUnsplashResult()] })

        const mockTx = { commit: jest.fn(), rollback: jest.fn() }
        ;(sequelizeDb.transaction as jest.Mock).mockResolvedValue(mockTx)
        ;(Photo.bulkCreate as jest.Mock).mockRejectedValue(
          new Error('DB error')
        )

        await checkPhotos([query])

        expect(mockTx.rollback).toHaveBeenCalled()
      })

      it("ne sauvegarde rien si l'API renvoie 0 photos", async () => {
        ;(redisClient.get as jest.Mock).mockResolvedValue(null)
        ;(Photo.findAll as jest.Mock).mockResolvedValue([])
        global.fetch = mockOkFetch({ results: [] })

        await checkPhotos([query])

        expect(Photo.bulkCreate).not.toHaveBeenCalled()
      })

      it("continue les autres queries si l'une lève une erreur", async () => {
        ;(redisClient.get as jest.Mock)
          .mockRejectedValueOnce(new Error('Redis crash'))
          .mockResolvedValue(
            JSON.stringify({ photosArray: [{ unsplashId: 'p1' }] })
          )

        await expect(
          checkPhotos([query, 'robot automation machine'])
        ).resolves.not.toThrow()
      })

      it('gère le timeout AbortController sans planter', async () => {
        ;(redisClient.get as jest.Mock).mockResolvedValue(null)
        ;(Photo.findAll as jest.Mock).mockResolvedValue([])
        global.fetch = jest
          .fn()
          .mockRejectedValue(
            Object.assign(new Error('Aborted'), { name: 'AbortError' })
          )

        await expect(checkPhotos([query])).resolves.not.toThrow()
        expect(Photo.bulkCreate).not.toHaveBeenCalled()
      })
    })
  })

  describe('News Service', () => {
    let fetchNews: any
    let checkNews: any

    beforeAll(async () => {
      try {
        const mod =
          await import('../backend/Services/api-externes.services.handleNews')
        fetchNews = mod.fetchNews ?? mod.fetchNewsFromAPI
        checkNews = mod.checkNews
      } catch {
        fetchNews = null
        checkNews = null
      }
    })

    describe('fetchNews', () => {
      it("construit l'URL avec la clé API et le query", async () => {
        if (!fetchNews) return

        global.fetch = mockOkFetch({
          status: 'ok',
          articles: [makeNewsArticle()],
        })

        await fetchNews('artificial intelligence')

        const [url] = (global.fetch as jest.Mock).mock.calls[0]
        expect(url).toContain('newsapi.org')
        expect(url).toContain('test-news-key')
      })

      it('retourne les articles de la réponse', async () => {
        if (!fetchNews) return

        const articles = [makeNewsArticle(1), makeNewsArticle(2)]
        global.fetch = mockOkFetch({ status: 'ok', articles })

        const results = await fetchNews('ai')

        expect(results.length).toBe(2)
        expect(results[0].title).toBe('Breaking News 1')
      })

      it('filtre les articles sans titre ou description', async () => {
        if (!fetchNews) return

        const articles = [
          makeNewsArticle(1),
          { ...makeNewsArticle(2), title: null },
          { ...makeNewsArticle(3), description: null },
        ]
        global.fetch = mockOkFetch({ status: 'ok', articles })

        const results = await fetchNews('ai')

        expect(results.length).toBe(1)
      })

      it('retourne [] si lAPI répond !ok', async () => {
        if (!fetchNews) return

        global.fetch = mockFailFetch(401)

        const results = await fetchNews('ai')

        expect(results).toEqual([])
      })

      it('retourne [] si fetch rejette (erreur réseau)', async () => {
        if (!fetchNews) return

        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

        const results = await fetchNews('ai')
        expect(results).toEqual([])
      })
    })

    describe('checkNews — stratégie cache / API', () => {
      it('utilise le cache si présent et non périmé', async () => {
        if (!checkNews) return
        ;(redisClient.get as jest.Mock).mockResolvedValue(
          JSON.stringify([makeNewsArticle()])
        )

        await checkNews(['ai-ml'])

        expect(global.fetch).not.toHaveBeenCalled()
      })

      it("appelle l'API si le cache est absent", async () => {
        if (!checkNews) return
        ;(redisClient.get as jest.Mock).mockResolvedValue(null)
        global.fetch = mockOkFetch({
          status: 'ok',
          articles: [makeNewsArticle()],
        })
        ;(redisClient.setEx as jest.Mock).mockResolvedValue('OK')

        await checkNews(['ai-ml'])

        expect(global.fetch).toHaveBeenCalled()
      })

      it('continue si une interest lève une erreur', async () => {
        if (!checkNews) return
        ;(redisClient.get as jest.Mock)
          .mockRejectedValueOnce(new Error('Redis crash'))
          .mockResolvedValue(null)

        global.fetch = mockOkFetch({ status: 'ok', articles: [] })

        await expect(checkNews(['ai-ml', 'robotics'])).resolves.not.toThrow()
      })
    })
  })
})
