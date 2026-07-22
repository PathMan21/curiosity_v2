process.env.ACCESS_TOKEN_SECRET = 'access_secret_test'
process.env.REFRESH_TOKEN_SECRET = 'refresh_secret_test'


jest.mock('../backend/Helpers/configLink', () => ({}))

jest.mock('../backend/Models/User', () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
}))

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'signed.jwt.token'),
  verify: jest.fn(),
}))

jest.mock('../backend/dtos/User', () => ({
  createUserSchema: { safeParse: jest.fn() },
  updateUserSchema: { safeParse: jest.fn() },
}))

jest.mock('../backend/Services/mail.services', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
}))

import User from '../backend/Models/User'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { createUserSchema, updateUserSchema } from '../backend/dtos/User'
import { sendVerificationEmail } from '../backend/Services/mail.services'
import {
  createUser,
  loginUser,
  logoutUser,
  refresh,
  getCurrentUser,
  updatedProfile,
} from '../backend/Controllers/user.controllers'


function makeRes() {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.cookie = jest.fn().mockReturnValue(res)
  res.clearCookie = jest.fn().mockReturnValue(res)
  return res
}

function makeReq(overrides = {}) {
  return {
    body: {},
    cookies: {},
    user: undefined,
    ...overrides,
  } as any
}

beforeEach(() => {
  jest.clearAllMocks()
})


describe('user.controllers', () => {

  describe('createUser', () => {
    it('retourne 400 si la validation du schéma échoue', async () => {
      const req = makeReq({ body: {} })
      const res = makeRes()
      ;(createUserSchema.safeParse as jest.Mock).mockReturnValue({
        success: false,
        error: 'invalid',
      })

      await createUser(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('retourne 409 si l’email existe déjà', async () => {
      const req = makeReq({
        body: { username: 'a', password: 'p', email: 'a@test.com' },
      })
      const res = makeRes()
      ;(createUserSchema.safeParse as jest.Mock).mockReturnValue({
        success: true,
        data: { username: 'a', password: 'p', email: 'a@test.com' },
      })
      ;(User.findOne as jest.Mock).mockResolvedValue({ id: 1 })

      await createUser(req, res)

      expect(res.status).toHaveBeenCalledWith(409)
    })

    it('crée l’utilisateur, envoie l’email de vérification et retourne 201', async () => {
      const req = makeReq({
        body: {
          username: 'a',
          password: 'p',
          email: 'a@test.com',
          interests: ['ai-ml'],
        },
      })
      const res = makeRes()
      ;(createUserSchema.safeParse as jest.Mock).mockReturnValue({
        success: true,
        data: {
          username: 'a',
          password: 'p',
          email: 'a@test.com',
          interests: ['ai-ml'],
        },
      })
      ;(User.findOne as jest.Mock).mockResolvedValue(null)
      ;(User.create as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'a',
        email: 'a@test.com',
      })

      await createUser(req, res)

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'a',
          interests: JSON.stringify(['ai-ml']),
          verified: false,
        })
      )
      expect(sendVerificationEmail).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(201)
    })

    it('crée l’utilisateur même si l’envoi de l’email échoue', async () => {
      const req = makeReq({
        body: { username: 'a', password: 'p', email: 'a@test.com' },
      })
      const res = makeRes()
      ;(createUserSchema.safeParse as jest.Mock).mockReturnValue({
        success: true,
        data: { username: 'a', password: 'p', email: 'a@test.com' },
      })
      ;(User.findOne as jest.Mock).mockResolvedValue(null)
      ;(User.create as jest.Mock).mockResolvedValue({
        id: 1,
        username: 'a',
        email: 'a@test.com',
      })
      ;(sendVerificationEmail as jest.Mock).mockRejectedValue(
        new Error('smtp down')
      )

      await createUser(req, res)

      expect(res.status).toHaveBeenCalledWith(201)
    })

    it('retourne 400 en cas d’erreur inattendue', async () => {
      const req = makeReq({
        body: { username: 'a', password: 'p', email: 'a@test.com' },
      })
      const res = makeRes()
      ;(createUserSchema.safeParse as jest.Mock).mockReturnValue({
        success: true,
        data: { username: 'a', password: 'p', email: 'a@test.com' },
      })
      ;(User.findOne as jest.Mock).mockRejectedValue(new Error('DB down'))

      await createUser(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'DB down' })
      )
    })
  })


  describe('loginUser', () => {
    it('retourne 400 si email ou password manquant', async () => {
      const req = makeReq({ body: { email: 'a@test.com' } })
      const res = makeRes()

      await loginUser(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('retourne 404 si l’utilisateur n’existe pas', async () => {
      const req = makeReq({ body: { email: 'a@test.com', password: 'p' } })
      const res = makeRes()
      ;(User.findOne as jest.Mock).mockResolvedValue(null)

      await loginUser(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('retourne 401 si le mot de passe est incorrect', async () => {
      const req = makeReq({ body: { email: 'a@test.com', password: 'wrong' } })
      const res = makeRes()
      ;(User.findOne as jest.Mock).mockResolvedValue({ password: 'hashed' })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await loginUser(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('retourne 403 si l’utilisateur n’est pas vérifié', async () => {
      const req = makeReq({ body: { email: 'a@test.com', password: 'p' } })
      const res = makeRes()
      ;(User.findOne as jest.Mock).mockResolvedValue({
        password: 'hashed',
        verified: false,
      })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      await loginUser(req, res)

      expect(res.status).toHaveBeenCalledWith(403)
    })

    it('connecte l’utilisateur, pose le cookie et retourne les tokens', async () => {
      const req = makeReq({ body: { email: 'a@test.com', password: 'p' } })
      const res = makeRes()
      const update = jest.fn()
      ;(User.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'a@test.com',
        username: 'a',
        verified: true,
        interests: '["ai-ml"]',
        picture: null,
        password: 'hashed',
        update,
      })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      await loginUser(req, res)

      expect(update).toHaveBeenCalledWith({ refreshToken: 'signed.jwt.token' })
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'signed.jwt.token',
        expect.objectContaining({ httpOnly: true })
      )
      const payload = (res.json as jest.Mock).mock.calls[0][0]
      expect(payload.status).toBe('Success')
      expect(payload.user.interests).toEqual(['ai-ml'])
    })

    it('retourne 500 en cas d’erreur inattendue', async () => {
      const req = makeReq({ body: { email: 'a@test.com', password: 'p' } })
      const res = makeRes()
      ;(User.findOne as jest.Mock).mockRejectedValue(new Error('DB down'))

      await loginUser(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })


  describe('logoutUser', () => {
    it('invalide le refreshToken en base et efface le cookie', async () => {
      const req = makeReq({ cookies: { refreshToken: 'tok' } })
      const res = makeRes()
      const update = jest.fn()
      ;(User.findOne as jest.Mock).mockResolvedValue({ update })

      await logoutUser(req, res)

      expect(update).toHaveBeenCalledWith({ refreshToken: null })
      expect(res.clearCookie).toHaveBeenCalled()
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Success' })
      )
    })

    it('fonctionne même sans cookie présent', async () => {
      const req = makeReq({ cookies: {} })
      const res = makeRes()

      await logoutUser(req, res)

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Success' })
      )
    })

    it('retourne 500 en cas d’erreur', async () => {
      const req = makeReq({ cookies: { refreshToken: 'tok' } })
      const res = makeRes()
      ;(User.findOne as jest.Mock).mockRejectedValue(new Error('DB down'))

      await logoutUser(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })


  describe('refresh', () => {
    it('retourne 401 si aucun token n’est présent', async () => {
      const req = makeReq({ cookies: {} })
      const res = makeRes()

      await refresh(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('retourne 401 si l’utilisateur n’existe plus', async () => {
      const req = makeReq({ cookies: { refreshToken: 'tok' } })
      const res = makeRes()
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
      ;(User.findByPk as jest.Mock).mockResolvedValue(null)

      await refresh(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('retourne 401 si le refreshToken ne correspond pas à celui stocké', async () => {
      const req = makeReq({ cookies: { refreshToken: 'tok' } })
      const res = makeRes()
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
      ;(User.findByPk as jest.Mock).mockResolvedValue({
        refreshToken: 'other-token',
      })

      await refresh(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('génère un nouvel access token si tout est valide', async () => {
      const req = makeReq({ cookies: { refreshToken: 'tok' } })
      const res = makeRes()
      ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 1 })
      ;(User.findByPk as jest.Mock).mockResolvedValue({ refreshToken: 'tok' })

      await refresh(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Success',
          token: 'signed.jwt.token',
        })
      )
    })

    it('retourne 401 si le token JWT est invalide', async () => {
      const req = makeReq({ cookies: { refreshToken: 'bad-tok' } })
      const res = makeRes()
      ;(jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid signature')
      })

      await refresh(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })
  })


  describe('getCurrentUser', () => {
    it('retourne les infos utilisateur avec interests parsés', async () => {
      const req = makeReq({ user: { id: 1 } })
      const res = makeRes()
      const get = jest.fn().mockReturnValue({
        id: 1,
        username: 'a',
        interests: '["ai-ml"]',
      })
      ;(User.findByPk as jest.Mock).mockResolvedValue({ get })

      await getCurrentUser(req, res)

      const payload = (res.json as jest.Mock).mock.calls[0][0]
      expect(payload.user.interests).toEqual(['ai-ml'])
    })

    it('retourne 401 si l’utilisateur n’est pas trouvé', async () => {
      const req = makeReq({ user: { id: 1 } })
      const res = makeRes()
      ;(User.findByPk as jest.Mock).mockResolvedValue(null)

      await getCurrentUser(req, res)

      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('gère un interests JSON invalide sans planter', async () => {
      const req = makeReq({ user: { id: 1 } })
      const res = makeRes()
      const get = jest.fn().mockReturnValue({
        id: 1,
        interests: 'not-json',
      })
      ;(User.findByPk as jest.Mock).mockResolvedValue({ get })

      await getCurrentUser(req, res)

      const payload = (res.json as jest.Mock).mock.calls[0][0]
      expect(payload.user.interests).toEqual([])
    })
  })


  describe('updatedProfile', () => {
    it('retourne 500 si l’utilisateur n’est pas trouvé', async () => {
      const req = makeReq({ user: { id: 1 }, body: {} })
      const res = makeRes()
      ;(User.findByPk as jest.Mock).mockResolvedValue(null)

      await updatedProfile(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })

    it('retourne 500 si la validation du schéma échoue', async () => {
      const req = makeReq({ user: { id: 1 }, body: {} })
      const res = makeRes()
      ;(User.findByPk as jest.Mock).mockResolvedValue({ id: 1 })
      ;(updateUserSchema.safeParse as jest.Mock).mockReturnValue({
        success: false,
      })

      await updatedProfile(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })

    it('met à jour le profil et retourne les nouvelles données', async () => {
      const req = makeReq({
        user: { id: 1 },
        body: { username: 'newName', interests: ['ai-ml'] },
      })
      const res = makeRes()
      const update = jest.fn()
      const reload = jest.fn()

      ;(User.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'a@test.com',
        username: 'newName',
        verified: true,
        interests: '["ai-ml"]',
        picture: null,
        update,
        reload,
      })
      ;(updateUserSchema.safeParse as jest.Mock).mockReturnValue({
        success: true,
        data: { username: 'newName', interests: ['ai-ml'], picture: undefined },
      })

      await updatedProfile(req, res)

      expect(update).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'newName',
          interests: JSON.stringify(['ai-ml']),
        })
      )
      expect(reload).toHaveBeenCalled()
      expect(res.cookie).toHaveBeenCalled()
      const payload = (res.json as jest.Mock).mock.calls[0][0]
      expect(payload.status).toBe('Success')
      expect(payload.user.interests).toEqual(['ai-ml'])
    })

    it('retourne 500 en cas d’erreur pendant la mise à jour', async () => {
      const req = makeReq({ user: { id: 1 }, body: { username: 'x' } })
      const res = makeRes()
      const update = jest.fn().mockRejectedValue(new Error('DB down'))

      ;(User.findByPk as jest.Mock).mockResolvedValue({ id: 1, update })
      ;(updateUserSchema.safeParse as jest.Mock).mockReturnValue({
        success: true,
        data: { username: 'x' },
      })

      await updatedProfile(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})
