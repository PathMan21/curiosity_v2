// â”€â”€â”€ Env â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
process.env.JWT_SECRET = 'test_secret'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret'
process.env.DB_NAME = 'test_db'
process.env.DB_USER = 'test_user'
process.env.ID_OAUTH = 'test_oauth_id'
process.env.URL_OAUTH = 'https://accounts.google.com/o/oauth2/v2/auth'
process.env.CALLBACK_OAUTH = 'http://localhost:3000/api/google/callback'

// â”€â”€â”€ Mocks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
jest.mock('../backend/Models/User', () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
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

jest.mock('../backend/Models/Favorite', () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  destroy: jest.fn(),
}))

jest.mock('../backend/Config/redis.conf', () => ({
  get: jest.fn(),
  setEx: jest.fn(),
}))

jest.mock('../backend/Config/dbInit', () => ({
  transaction: jest.fn(),
  authenticate: jest.fn(),
  sync: jest.fn(),
}))

jest.mock('../backend/Services/mail.services', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue({}),
  verifyEmail: jest.fn(),
  resendVerificationEmail: jest.fn(),
}))

jest.mock('../backend/Helpers/CheckTooOld', () => ({
  isArticlesTooOld: jest.fn(() => true),
  isPhotosTooOld: jest.fn(() => true),
}))

jest.mock('../backend/dtos/Article', () => ({
  createArticleSchema: { parse: jest.fn((d) => d) },
}))

jest.mock('../backend/dtos/Photos', () => ({
  createPhotosSchema: { parse: jest.fn((d) => d) },
}))

import request from 'supertest'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../backend/Models/User'
import Article from '../backend/Models/Article'
import Favorite from '../backend/Models/Favorite'
import redisClient from '../backend/Config/redis.conf'

jest.mock('bcrypt')
jest.mock('jsonwebtoken')

// Import app aprÃ¨s les mocks
import app from '../backend/app'

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const makeAuthToken = (userId = 1) => {
  ;(jwt.verify as jest.Mock).mockReturnValue({ userId })
  return 'Bearer valid-test-token'
}

const mockUserInDB = (overrides: Record<string, any> = {}) => ({
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  password: '$2b$10$hashedpassword',
  verified: true,
  interests: JSON.stringify(['ai-ml', 'robotics']),
  update: jest.fn().mockResolvedValue({}),
  reload: jest.fn().mockResolvedValue({}),
  toJSON: jest.fn(function () {
    return { ...this }
  }),
  ...overrides,
})

// â”€â”€â”€ Suite â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe("Routes Express â€” Tests d'intÃ©gration", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  // â”€â”€ Auth Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('POST /api/auth/register', () => {
    it('retourne 201 avec un utilisateur valide', async () => {
      ;(User.findOne as jest.Mock).mockResolvedValue(null)
      ;(User.create as jest.Mock).mockResolvedValue({ id: 1 })
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashed')

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'new@example.com',
          password: 'Test@12345',
          interests: ['ai-ml'],
        })

      expect(res.status).toBe(201)
    })

    it("retourne 409 si l'email existe dÃ©jÃ ", async () => {
      ;(User.findOne as jest.Mock).mockResolvedValue({ id: 1 })

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existing',
          email: 'existing@example.com',
          password: 'Test@12345',
          interests: ['ai-ml'],
        })

      expect(res.status).toBe(409)
    })

    it('retourne 400 si les donnÃ©es sont incomplÃ¨tes', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'user' }) // email et password manquants

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('retourne 200 et un token sur login rÃ©ussi', async () => {
      const user = mockUserInDB()
      ;(User.findOne as jest.Mock).mockResolvedValue(user)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(jwt.sign as jest.Mock).mockReturnValue('access-token')

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Test@12345' })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
    })

    it('retourne 401 si le mot de passe est incorrect', async () => {
      const user = mockUserInDB()
      ;(User.findOne as jest.Mock).mockResolvedValue(user)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' })

      expect(res.status).toBe(401)
    })

    it("retourne 403 si l'utilisateur n'est pas vÃ©rifiÃ©", async () => {
      const user = mockUserInDB({ verified: false })
      ;(User.findOne as jest.Mock).mockResolvedValue(user)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Test@12345' })

      expect(res.status).toBe(403)
    })

    it("retourne 404 si l'utilisateur est introuvable", async () => {
      ;(User.findOne as jest.Mock).mockResolvedValue(null)

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'Test@12345' })

      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/auth/me', () => {
    it("retourne l'utilisateur courant avec un token valide", async () => {
      const user = mockUserInDB()
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
      ;(User.findByPk as jest.Mock).mockResolvedValue(user)

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', makeAuthToken())

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('email', 'test@example.com')
    })

    it('retourne 401 sans token', async () => {
      const res = await request(app).get('/api/auth/me')

      expect(res.status).toBe(401)
    })

    it('retourne 401 avec un token invalide', async () => {
      ;(jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid token')
      })

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')

      expect(res.status).toBe(401)
    })
  })

  // â”€â”€ User Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('PUT /api/user/profile', () => {
    it('met Ã  jour le profil avec un token valide', async () => {
      const user = mockUserInDB()
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
      ;(User.findByPk as jest.Mock).mockResolvedValue(user)
      ;(jwt.sign as jest.Mock).mockReturnValue('new-token')

      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', makeAuthToken())
        .send({
          username: 'updateduser',
          interests: ['ai-ml', 'cybersecurity'],
        })

      expect(res.status).toBe(200)
      expect(user.update).toHaveBeenCalled()
    })

    it('retourne 401 sans token', async () => {
      const res = await request(app)
        .put('/api/user/profile')
        .send({ username: 'updateduser' })

      expect(res.status).toBe(401)
    })
  })

  // â”€â”€ OpenAlex Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('GET /api/openalex', () => {
    it('retourne des articles avec un token valide', async () => {
      const user = mockUserInDB()
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
      ;(User.findByPk as jest.Mock).mockResolvedValue(user)
      ;(redisClient.get as jest.Mock).mockResolvedValue(null)
      ;(Article.findAll as jest.Mock).mockResolvedValue([
        {
          toJSON: () => ({ openAlexId: 'W1', title: 'Test', subfield: '1702' }),
        },
      ])

      const res = await request(app)
        .get('/api/openalex')
        .set('Authorization', makeAuthToken())

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('articles')
    })

    it("retourne 400 si l'utilisateur n'a aucun intÃ©rÃªt", async () => {
      const user = mockUserInDB({ interests: null })
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
      ;(User.findByPk as jest.Mock).mockResolvedValue(user)

      const res = await request(app)
        .get('/api/openalex')
        .set('Authorization', makeAuthToken())

      expect(res.status).toBe(400)
    })

    it('retourne 401 sans token', async () => {
      const res = await request(app).get('/api/openalex')
      expect(res.status).toBe(401)
    })
  })

  // â”€â”€ Favorites Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('GET /api/favorites', () => {
    it("retourne les favoris de l'utilisateur connectÃ©", async () => {
      const user = mockUserInDB()
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
      ;(User.findByPk as jest.Mock).mockResolvedValue(user)
      ;(Favorite.findAll as jest.Mock).mockResolvedValue([
        { id: 1, articles_id: 'W1', user_id: 1 },
      ])

      const res = await request(app)
        .get('/api/favorites')
        .set('Authorization', makeAuthToken())

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('favorites')
    })

    it('retourne 401 sans token', async () => {
      const res = await request(app).get('/api/favorites')
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/favorites', () => {
    it('ajoute un favori et retourne 201', async () => {
      const user = mockUserInDB()
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
      ;(User.findByPk as jest.Mock).mockResolvedValue(user)
      ;(Favorite.findOne as jest.Mock).mockResolvedValue(null)
      ;(Favorite.create as jest.Mock).mockResolvedValue({
        id: 10,
        articles_id: 'W1',
        user_id: 1,
      })

      const res = await request(app)
        .post('/api/favorites')
        .set('Authorization', makeAuthToken())
        .send({ articles_id: 'W1' })

      expect(res.status).toBe(201)
    })

    it('retourne 409 si le favori existe dÃ©jÃ ', async () => {
      const user = mockUserInDB()
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
      ;(User.findByPk as jest.Mock).mockResolvedValue(user)
      ;(Favorite.findOne as jest.Mock).mockResolvedValue({
        id: 10,
        articles_id: 'W1',
      })

      const res = await request(app)
        .post('/api/favorites')
        .set('Authorization', makeAuthToken())
        .send({ articles_id: 'W1' })

      expect(res.status).toBe(409)
    })

    it('retourne 400 si articles_id est absent', async () => {
      const user = mockUserInDB()
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
      ;(User.findByPk as jest.Mock).mockResolvedValue(user)

      const res = await request(app)
        .post('/api/favorites')
        .set('Authorization', makeAuthToken())
        .send({})

      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /api/favorites', () => {
    it('supprime un favori et retourne 200', async () => {
      const user = mockUserInDB()
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
      ;(User.findByPk as jest.Mock).mockResolvedValue(user)

      const mockFav = {
        id: 5,
        articles_id: 'W1',
        destroy: jest.fn().mockResolvedValue(undefined),
      }
      ;(Favorite.findOne as jest.Mock).mockResolvedValue(mockFav)

      const res = await request(app)
        .delete('/api/favorites')
        .set('Authorization', makeAuthToken())
        .send({ articles_id: 'W1' })

      expect(res.status).toBe(200)
      expect(mockFav.destroy).toHaveBeenCalled()
    })

    it("retourne 404 si le favori n'existe pas", async () => {
      const user = mockUserInDB()
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
      ;(User.findByPk as jest.Mock).mockResolvedValue(user)
      ;(Favorite.findOne as jest.Mock).mockResolvedValue(null)

      const res = await request(app)
        .delete('/api/favorites')
        .set('Authorization', makeAuthToken())
        .send({ articles_id: 'W99' })

      expect(res.status).toBe(404)
    })
  })

  // â”€â”€ OAuth Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  describe('GET /api/google/verify', () => {
    it('retourne une URL OAuth avec un Ã©tat CSRF', async () => {
      const res = await request(app).get('/api/google/verify')

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('url')
      expect(res.body.url).toContain('accounts.google.com')
    })
  })

  describe('GET /api/google/callback', () => {
    it('retourne 400 si le state CSRF est invalide', async () => {
      const res = await request(app)
        .get('/api/google/callback')
        .query({ code: 'auth_code', state: 'wrong_state' })

      expect(res.status).toBe(400)
    })

    it('retourne 400 si le code est absent', async () => {
      const res = await request(app)
        .get('/api/google/callback')
        .query({ state: 'some_state' })

      expect(res.status).toBe(400)
    })
  })
})
