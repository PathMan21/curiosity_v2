// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../backend/Models/Likes', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
}))

import Likes from '../backend/Models/Likes'
import {
  toggleLikes,
  getUserLikes,
  checkLikeStatus,
} from '../backend/Controllers/likes.controllers'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRes() {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

function makeReq(overrides = {}) {
  return {
    user: { id: 1 },
    body: {},
    query: {},
    ...overrides,
  } as any
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('likes.controllers', () => {
  // ── toggleLikes ─────────────────────────────────────────────────────────────

  describe('toggleLikes', () => {
    it('retourne 401 si utilisateur non authentifié', async () => {
      const req = makeReq({ user: undefined })
      const res = makeRes()

      await toggleLikes(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Failed' })
      )
    })

    it('retourne 400 si contentId ou contentType manquant', async () => {
      const req = makeReq({ body: { contentId: '5' } })
      const res = makeRes()

      await toggleLikes(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('retourne 400 si contentType n’est pas dans la liste autorisée', async () => {
      const req = makeReq({
        body: { contentId: '5', contentType: 'video' },
      })
      const res = makeRes()

      await toggleLikes(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'contentType invalide' })
      )
    })

    it('supprime le like existant et retourne liked: false', async () => {
      const req = makeReq({
        body: { contentId: '5', contentType: 'article' },
      })
      const res = makeRes()
      const destroy = jest.fn()
      ;(Likes.findOne as jest.Mock).mockResolvedValue({ destroy })

      await toggleLikes(req, res)

      expect(destroy).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith({
        message: 'Like removed',
        liked: false,
      })
    })

    it('crée un nouveau like et retourne liked: true', async () => {
      const req = makeReq({
        body: { contentId: '5', contentType: 'article' },
      })
      const res = makeRes()
      ;(Likes.findOne as jest.Mock).mockResolvedValue(null)
      ;(Likes.create as jest.Mock).mockResolvedValue({ id: 1 })

      await toggleLikes(req, res)

      expect(Likes.create).toHaveBeenCalledWith({
        userId: 1,
        contentId: '5',
        contentType: 'article',
      })
      expect(res.json).toHaveBeenCalledWith({
        message: 'Like added',
        liked: true,
      })
    })

    it('retourne 500 si la création du like échoue', async () => {
      const req = makeReq({
        body: { contentId: '5', contentType: 'article' },
      })
      const res = makeRes()
      ;(Likes.findOne as jest.Mock).mockResolvedValue(null)
      ;(Likes.create as jest.Mock).mockResolvedValue(null)

      await toggleLikes(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })

    it('retourne 500 en cas d’erreur inattendue', async () => {
      const req = makeReq({
        body: { contentId: '5', contentType: 'article' },
      })
      const res = makeRes()
      ;(Likes.findOne as jest.Mock).mockRejectedValue(new Error('DB down'))

      await toggleLikes(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  // ── getUserLikes ─────────────────────────────────────────────────────────────

  describe('getUserLikes', () => {
    it('retourne 401 si utilisateur non authentifié', async () => {
      const req = makeReq({ user: undefined })
      const res = makeRes()

      await getUserLikes(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('regroupe les likes par contentType', async () => {
      const req = makeReq()
      const res = makeRes()
      ;(Likes.findAll as jest.Mock).mockResolvedValue([
        { contentType: 'article', contentId: '1' },
        { contentType: 'article', contentId: '2' },
        { contentType: 'photo', contentId: '9' },
      ])

      await getUserLikes(req, res)

      expect(res.json).toHaveBeenCalledWith({
        likes: {
          article: ['1', '2'],
          photo: ['9'],
        },
      })
    })

    it('retourne un objet vide si aucun like', async () => {
      const req = makeReq()
      const res = makeRes()
      ;(Likes.findAll as jest.Mock).mockResolvedValue([])

      await getUserLikes(req, res)

      expect(res.json).toHaveBeenCalledWith({ likes: {} })
    })

    it('retourne 500 en cas d’erreur base de données', async () => {
      const req = makeReq()
      const res = makeRes()
      ;(Likes.findAll as jest.Mock).mockRejectedValue(new Error('DB error'))

      await getUserLikes(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })

  // ── checkLikeStatus ──────────────────────────────────────────────────────────

  describe('checkLikeStatus', () => {
    it('retourne 401 si utilisateur non authentifié', async () => {
      const req = makeReq({
        user: undefined,
        query: { contentId: '1', contentType: 'article' },
      })
      const res = makeRes()

      await checkLikeStatus(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('retourne 400 si contentId ou contentType manquant', async () => {
      const req = makeReq({ query: {} })
      const res = makeRes()

      await checkLikeStatus(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('retourne liked: true si le like existe', async () => {
      const req = makeReq({ query: { contentId: '1', contentType: 'article' } })
      const res = makeRes()
      ;(Likes.findOne as jest.Mock).mockResolvedValue({ id: 1 })

      await checkLikeStatus(req, res)

      expect(res.json).toHaveBeenCalledWith({ liked: true })
    })

    it('retourne liked: false si le like n’existe pas', async () => {
      const req = makeReq({ query: { contentId: '1', contentType: 'article' } })
      const res = makeRes()
      ;(Likes.findOne as jest.Mock).mockResolvedValue(null)

      await checkLikeStatus(req, res)

      expect(res.json).toHaveBeenCalledWith({ liked: false })
    })

    it('retourne 500 en cas d’erreur base de données', async () => {
      const req = makeReq({ query: { contentId: '1', contentType: 'article' } })
      const res = makeRes()
      ;(Likes.findOne as jest.Mock).mockRejectedValue(new Error('DB error'))

      await checkLikeStatus(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})
