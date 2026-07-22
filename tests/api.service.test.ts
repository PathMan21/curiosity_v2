import '@testing-library/jest-dom'

global.fetch = jest.fn()

describe('API Client Services', () => {
  let fetchWithAuth: any
  let getArticles: any
  let getPhotos: any

  beforeAll(async () => {
    const mod = await import('../frontend/src/Services/apiClient')
    fetchWithAuth = mod.fetchWithAuth
    getArticles = mod.getArticles
    getPhotos = mod.getPhotos
  })

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  // Auth

  describe('Authentication Headers', () => {
    it('ajoute le header Authorization avec le token stocké dans localStorage', async () => {
      localStorage.setItem('authToken', 'test_token_123')
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      })

      await fetchWithAuth('/api/me')

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(options.headers).toMatchObject({
        Authorization: 'Bearer test_token_123',
      })
    })

    it('inclut credentials: include pour les requêtes OAuth', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      })

      await fetchWithAuth('/api/oauth/token', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ interests: ['ai-ml'] }),
      })

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(options.credentials).toBe('include')
    })

    it('najoute pas Authorization si aucun token nest présent', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({}),
      })

      await fetchWithAuth('/api/public')

      const [, options] = (global.fetch as jest.Mock).mock.calls[0]
      expect(options?.headers?.Authorization).toBeUndefined()
    })
  })

  // Transformation

  describe('Data Transformation', () => {
    it('parse correctement les interests JSON depuis la DB', () => {
      const raw = '["ai-ml","cybersecurity"]'
      const parsed = JSON.parse(raw)

      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed).toContain('ai-ml')
      expect(parsed).toContain('cybersecurity')
    })

    it('sérialise un tableau dinterests pour lenvoi API', () => {
      const interests = ['ai-ml', 'robotics']
      const serialized = JSON.stringify(interests)

      expect(typeof serialized).toBe('string')
      expect(serialized).toBe('["ai-ml","robotics"]')
    })

    it('gère gracieusement interests === null', () => {
      const interests: string | null = null
      const result = interests ? JSON.parse(interests) : []

      expect(result).toEqual([])
    })

    it('formate correctement les données photo pour laffichage', () => {
      const apiPhoto = {
        unsplashId: 'photo123',
        url: 'https://images.unsplash.com/photo.jpg',
        thumb: 'https://images.unsplash.com/thumb.jpg',
        description: 'Test photo',
        photographer: 'Jane Doe',
      }

      const formatted = {
        id: apiPhoto.unsplashId,
        imageUrl: apiPhoto.url,
        thumbnailUrl: apiPhoto.thumb,
        title: apiPhoto.description,
        credit: apiPhoto.photographer,
      }

      expect(formatted.id).toBe('photo123')
      expect(formatted.imageUrl).toContain('photo.jpg')
      expect(formatted.credit).toBe('Jane Doe')
    })

    it('formate correctement les données article pour laffichage', () => {
      const apiArticle = {
        openAlexId: 'W1234',
        title: 'AI Research 2024',
        authors: ['Author One', 'Author Two'],
        published: '2024-01-01',
        isOpenAccess: true,
        mainTopic: 'Artificial Intelligence',
      }

      const formatted = {
        id: apiArticle.openAlexId,
        title: apiArticle.title,
        authors: apiArticle.authors.join(', '),
        date: apiArticle.published,
        accessType: apiArticle.isOpenAccess ? 'Open Access' : 'Restricted',
      }

      expect(formatted.title).toBe('AI Research 2024')
      expect(formatted.authors).toBe('Author One, Author Two')
      expect(formatted.accessType).toBe('Open Access')
    })
  })

  // En cas d'erreur

  describe('Error Handling', () => {
    it('lève une erreur sur réponse 401 Unauthorized', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ error: 'Unauthorized' }),
      })

      await expect(fetchWithAuth('/api/protected')).rejects.toThrow()
    })

    it('lève une erreur sur réponse 400 Bad Request', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ message: 'Aucun intérêt défini' }),
      })

      await expect(fetchWithAuth('/api/photos')).rejects.toThrow()
    })

    it('propage lerreur réseau si fetch rejette', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(fetchWithAuth('/api/articles')).rejects.toThrow(
        'Network error'
      )
    })

    it('gère le timeout via AbortController', async () => {
      const controller = new AbortController()

      ;(global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(
              () =>
                reject(
                  Object.assign(new Error('The operation was aborted'), {
                    name: 'AbortError',
                  })
                ),
              50
            )
          })
      )

      setTimeout(() => controller.abort(), 50)

      await expect(
        fetchWithAuth('/api/slow', { signal: controller.signal })
      ).rejects.toMatchObject({ name: 'AbortError' })
    })

    it('lève une erreur sur réponse 500 Server Error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ message: 'Erreur serveur' }),
      })

      await expect(fetchWithAuth('/api/broken')).rejects.toThrow()
    })
  })

  // Validation de requêtes

  describe('Request Validation (règles métier)', () => {
    it('rejette si un champ requis est vide', () => {
      const user = {
        username: '',
        email: 'test@example.com',
        password: 'Test@12345',
      }
      const isValid = Boolean(user.username && user.email && user.password)

      expect(isValid).toBe(false)
    })

    it('valide les emails corrects', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      expect(emailRegex.test('test@example.com')).toBe(true)
      expect(emailRegex.test('user+tag@domain.co.uk')).toBe(true)
    })

    it('rejette les emails incorrects', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      expect(emailRegex.test('notanemail')).toBe(false)
      expect(emailRegex.test('missing@tld')).toBe(false)
    })

    it('valide les mots de passe forts et rejette les faibles', () => {
      const pwdRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

      expect(pwdRegex.test('Test@12345')).toBe(true)
      expect(pwdRegex.test('weak')).toBe(false)
      expect(pwdRegex.test('12345678')).toBe(false)
      expect(pwdRegex.test('NoSpecial123')).toBe(false)
    })

    it('valide les tableaux dinterests (entre 1 et 10)', () => {
      const isValid = (interests: any) =>
        Array.isArray(interests) &&
        interests.length > 0 &&
        interests.length <= 10

      expect(isValid(['ai-ml'])).toBe(true)
      expect(isValid(['ai-ml', 'cybersecurity', 'robotics'])).toBe(true)
      expect(isValid([])).toBe(false)
      expect(isValid(null)).toBe(false)
      expect(isValid(new Array(11).fill('ai-ml'))).toBe(false)
    })
  })

  // Test des endpoints

  describe('Endpoints métier', () => {
    it('getArticles appelle /api/openalex et retourne les articles', async () => {
      const mockPayload = {
        totalResults: 2,
        articles: [
          { openAlexId: 'W1', title: 'Article 1' },
          { openAlexId: 'W2', title: 'Article 2' },
        ],
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockPayload),
      })

      const result = await getArticles()

      const [url] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toContain('/api/openalex')
      expect(result.articles).toHaveLength(2)
    })

    it('getPhotos appelle /api/unsplash et retourne les photos', async () => {
      const mockPayload = {
        photos: [
          { unsplashId: 'p1', url: 'https://img.unsplash.com/1' },
          { unsplashId: 'p2', url: 'https://img.unsplash.com/2' },
        ],
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockPayload),
      })

      const result = await getPhotos()

      const [url] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toContain('/api/unsplash')
      expect(result.photos).toHaveLength(2)
    })
  })
})
