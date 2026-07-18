// ─── Mocks ────────────────────────────────────────────────────────────────────

process.env.ACCESS_TOKEN_SECRET = 'test-secret-key'

jest.mock('../backend/Models/User', () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn(),
  },
}))

// ─── Imports ──────────────────────────────────────────────────────────────────

import jwt from 'jsonwebtoken'
import User from '../backend/Models/User'
import {
  validateUser,
  authentificatedUser,
  validateUserOauth,
} from '../backend/middlewares/user.middlewares'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockReq(overrides: any = {}): any {
  return {
    body: {},
    headers: {},
    ...overrides,
  }
}

function mockRes(): any {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

// ─── Suite: validateUserOauth ─────────────────────────────────────────────────

describe('user.middlewares – validateUserOauth', () => {
  let next: jest.Mock

  beforeEach(() => {
    next = jest.fn()
  })

  it('appelle next() avec un username et mot de passe valides', () => {
    const req = mockReq({
      body: { username: 'JohnDoe', password: 'Test@123abc' },
    })
    const res = mockRes()

    validateUserOauth(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('retourne 400 si le mot de passe est manquant', () => {
    const req = mockReq({
      body: { username: 'JohnDoe' },
    })
    const res = mockRes()

    validateUserOauth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'mot de passe invalide' })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('retourne 400 si le mot de passe est trop faible', () => {
    const req = mockReq({
      body: { username: 'JohnDoe', password: 'weak' },
    })
    const res = mockRes()

    validateUserOauth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'mot de passe invalide' })
    )
  })

  it('retourne 400 si le username est manquant', () => {
    const req = mockReq({
      body: { password: 'Test@123abc' },
    })
    const res = mockRes()

    validateUserOauth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'username invalide' })
    )
  })

  it('retourne 400 si le username contient des caractères spéciaux', () => {
    const req = mockReq({
      body: { username: 'John<script>', password: 'Test@123abc' },
    })
    const res = mockRes()

    validateUserOauth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'username invalide' })
    )
  })

  it('retourne 400 si les intérêts ne sont pas un tableau', () => {
    const req = mockReq({
      body: {
        username: 'JohnDoe',
        password: 'Test@123abc',
        interests: 'not-an-array',
      },
    })
    const res = mockRes()

    validateUserOauth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('intérêts invalides'),
      })
    )
  })

  it('retourne 400 si les intérêts sont un tableau vide', () => {
    const req = mockReq({
      body: {
        username: 'JohnDoe',
        password: 'Test@123abc',
        interests: [],
      },
    })
    const res = mockRes()

    validateUserOauth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('intérêts invalides'),
      })
    )
  })

  it('retourne 400 si les intérêts dépassent 10 éléments', () => {
    const req = mockReq({
      body: {
        username: 'JohnDoe',
        password: 'Test@123abc',
        interests: Array(11).fill('topic'),
      },
    })
    const res = mockRes()

    validateUserOauth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('autorise les intérêts valides (1-10 éléments)', () => {
    const req = mockReq({
      body: {
        username: 'JohnDoe',
        password: 'Test@123abc',
        interests: ['IA', 'physique', 'chimie'],
      },
    })
    const res = mockRes()

    validateUserOauth(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
  })
})

// ─── Suite: validateUser ──────────────────────────────────────────────────────

describe('user.middlewares – validateUser', () => {
  let next: jest.Mock

  beforeEach(() => {
    next = jest.fn()
  })

  it('appelle next() avec des données valides', () => {
    const req = mockReq({
      body: {
        username: 'JohnDoe',
        email: 'john@example.com',
        password: 'Test@123abc',
      },
    })
    const res = mockRes()

    validateUser(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
  })

  it("retourne 400 si l'email est manquant", () => {
    const req = mockReq({
      body: { username: 'JohnDoe', password: 'Test@123abc' },
    })
    const res = mockRes()

    validateUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Email invalide' })
    )
  })

  it("retourne 400 si l'email est invalide", () => {
    const req = mockReq({
      body: {
        username: 'JohnDoe',
        email: 'invalid-email',
        password: 'Test@123abc',
      },
    })
    const res = mockRes()

    validateUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Email invalide' })
    )
  })

  it('retourne 400 si le mot de passe est manquant', () => {
    const req = mockReq({
      body: { username: 'JohnDoe', email: 'john@example.com' },
    })
    const res = mockRes()

    validateUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('mot de passe'),
      })
    )
  })

  it('retourne 400 si le mot de passe est trop faible', () => {
    const req = mockReq({
      body: {
        username: 'JohnDoe',
        email: 'john@example.com',
        password: 'weak',
      },
    })
    const res = mockRes()

    validateUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('retourne 400 si le username est trop court (<3 caractères)', () => {
    const req = mockReq({
      body: {
        username: 'ab',
        email: 'john@example.com',
        password: 'Test@123abc',
      },
    })
    const res = mockRes()

    validateUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Username invalide'),
      })
    )
  })

  it('retourne 400 si le username est manquant', () => {
    const req = mockReq({
      body: { email: 'john@example.com', password: 'Test@123abc' },
    })
    const res = mockRes()

    validateUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
  })
})

// ─── Suite: authentificatedUser ───────────────────────────────────────────────

describe('user.middlewares – authentificatedUser', () => {
  let next: jest.Mock

  beforeEach(() => {
    next = jest.fn()
    jest.clearAllMocks()
  })

  it('retourne 401 si le header Authorization est manquant', async () => {
    const req = mockReq({ headers: {} })
    const res = mockRes()

    await authentificatedUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Token manquant' })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('retourne 401 si le token est mal formaté (pas de Bearer)', async () => {
    const req = mockReq({
      headers: { authorization: 'invalidtoken' },
    })
    const res = mockRes()

    await authentificatedUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Token invalide ou mal formaté' })
    )
  })

  it('retourne 401 si le token est expiré', async () => {
    // Créer un token expiré
    const expiredToken = jwt.sign(
      { userId: 1 },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: '0s' }
    )
    const req = mockReq({
      headers: { authorization: `Bearer ${expiredToken}` },
    })
    const res = mockRes()

    // Attendre un tick pour que le token expire
    await new Promise((r) => setTimeout(r, 10))

    await authentificatedUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Token expiré' })
    )
  })

  it('retourne 401 si le token est invalide (mauvais secret)', async () => {
    const badToken = jwt.sign({ userId: 1 }, 'wrong-secret')
    const req = mockReq({
      headers: { authorization: `Bearer ${badToken}` },
    })
    const res = mockRes()

    await authentificatedUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Token invalide' })
    )
  })

  it("retourne 401 si l'utilisateur n'existe pas en base", async () => {
    const validToken = jwt.sign(
      { userId: 999 },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: '1h' }
    )
    const req = mockReq({
      headers: { authorization: `Bearer ${validToken}` },
    })
    const res = mockRes()
    ;(User.findByPk as jest.Mock).mockResolvedValue(null)

    await authentificatedUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Utilisateur introuvable' })
    )
  })

  it("attache l'utilisateur à req.user et appelle next() si tout est OK", async () => {
    const validToken = jwt.sign(
      { userId: 42 },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: '1h' }
    )
    const mockUser = { id: 42, username: 'JohnDoe', email: 'john@example.com' }
    ;(User.findByPk as jest.Mock).mockResolvedValue(mockUser)

    const req = mockReq({
      headers: { authorization: `Bearer ${validToken}` },
    })
    const res = mockRes()

    await authentificatedUser(req, res, next)

    expect(req.user).toEqual(mockUser)
    expect(next).toHaveBeenCalledTimes(1)
    expect(res.status).not.toHaveBeenCalled()
  })

  it('retourne 500 si une erreur inattendue survient', async () => {
    const validToken = jwt.sign(
      { userId: 1 },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: '1h' }
    )
    ;(User.findByPk as jest.Mock).mockRejectedValue(new Error('DB down'))

    const req = mockReq({
      headers: { authorization: `Bearer ${validToken}` },
    })
    const res = mockRes()

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    await authentificatedUser(req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Erreur serveur' })
    )
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })
})
