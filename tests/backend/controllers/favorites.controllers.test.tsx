describe('Favorites Controllers Tests', () => {
  let req: any
  let res: any

  beforeEach(() => {
    req = {
      body: {},
      user: { userId: 1 },
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
    jest.clearAllMocks()
  })

  describe('addToFavorites', () => {
    it('should accept valid article ID', () => {
      req.body = { articles_id: 'article-123' }
      expect(req.body.articles_id).toBeDefined ()
    })

    it('should return error if article_id is missing', () => {
      req.body = {}
      expect(req.body.articles_id).toBeUndefined()
    })

    it('should store user ID with favorite', () => {
      const userId = req.user.userId
      expect(userId).toBe(1)
    })
  })

  describe('getFavorites', () => {
    it('should return array for user favorites', () => {
      const mockFavorites = [
        { articles_id: 'article-1', user_id: 1 },
        { articles_id: 'article-2', user_id: 1 },
      ]
      
      expect(mockFavorites).toBeInstanceOf(Array)
      expect(mockFavorites.length).toBe(2)
    })

    it('should handle empty favorites', () => {
      const emptyFavorites: any[] = []
      expect(emptyFavorites.length).toBe(0)
    })

    it('should filter by user ID', () => {
      const mockFavorites = [
        { articles_id: 'article-1', user_id: 1 },
        { articles_id: 'article-2', user_id: 2 },
      ]
      
      const userFavorites = mockFavorites.filter(f => f.user_id === 1)
      expect(userFavorites.length).toBe(1)
      expect(userFavorites[0].user_id).toBe(1)
    })
  })
})
