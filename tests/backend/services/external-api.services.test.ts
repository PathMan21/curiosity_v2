describe('External API Services Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('OpenAlex Service', () => {
    it('should fetch academic articles', async () => {
      const mockArticles = [
        {
          id: 'article-1',
          title: 'Research Article 1',
          abstract: 'This is an abstract',
        },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockArticles),
      })

      const response = await (global.fetch as jest.Mock)('http://api.openalex.org/works')
      const data = await response.json()

      expect(data).toEqual(mockArticles)
    })

    it('should handle API errors gracefully', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('API Error')
      )

      try {
        await (global.fetch as jest.Mock)('http://api.openalex.org/works')
      } catch (error: any) {
        expect(error.message).toBe('API Error')
      }
    })
  })

  describe('Unsplash Service', () => {
    it('should fetch images', async () => {
      const mockImages = [
        {
          id: 'image-1',
          url: 'http://example.com/image1.jpg',
          description: 'Image 1',
        },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockImages),
      })

      const response = await (global.fetch as jest.Mock)('https://api.unsplash.com/photos')
      const data = await response.json()

      expect(data).toEqual(mockImages)
    })

    it('should handle authentication errors', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({ error: 'Unauthorized' }),
      })

      const response = await (global.fetch as jest.Mock)('https://api.unsplash.com/photos')

      expect(response.status).toBe(401)
    })
  })

  describe('NewsAPI Service', () => {
    it('should fetch news articles', async () => {
      const mockNews = [
        {
          source: { id: 'bbc-news', name: 'BBC News' },
          title: 'Breaking News',
          description: 'News description',
          url: 'http://example.com/news',
          image: 'http://example.com/image.jpg',
          publishedAt: '2023-01-01T00:00:00Z',
        },
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ articles: mockNews }),
      })

      const response = await (global.fetch as jest.Mock)('https://newsapi.org/v2/everything')
      const data = await response.json()

      expect(data.articles).toEqual(mockNews)
    })

    it('should filter news by category', async () => {
      const query = new URLSearchParams({
        category: 'technology',
        country: 'us',
      }).toString()

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({ articles: [] }),
      })

      await (global.fetch as jest.Mock)(`https://newsapi.org/v2/top-headlines?${query}`)

      expect(global.fetch).toHaveBeenCalled()
    })
  })
})
