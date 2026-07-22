process.env.ACCESS_TOKEN_SECRET = 'access_secret_test'
process.env.REFRESH_TOKEN_SECRET = 'refresh_secret_test'
process.env.SERVER_URL = 'https://app.test'
process.env.AUTH_MAIL = 'noreply@app.test'


jest.mock('../backend/Helpers/configLink', () => ({}))

jest.mock('../backend/Models/User', () => ({
  findByPk: jest.fn(),
  update: jest.fn(),
}))

jest.mock('../backend/Models/UserVerifications', () => ({
  findOne: jest.fn(),
  destroy: jest.fn(),
  create: jest.fn(),
}))

jest.mock('../backend/Config/emailConfig', () => ({
  transport: { sendMail: jest.fn().mockResolvedValue(undefined) },
}))

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('hashed-unique-string'),
}))

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'uuid-fixed-value'),
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'signed.jwt.token'),
}))

import User from '../backend/Models/User'
import UserVerifications from '../backend/Models/UserVerifications'
import { transport } from '../backend/Config/emailConfig'
import bcrypt from 'bcrypt'
import {
  sendVerificationEmail,
  verifyUser,
} from '../backend/Services/mail.services'


function makeRes() {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.cookie = jest.fn().mockReturnValue(res)
  res.redirect = jest.fn().mockReturnValue(res)
  return res
}

function makeReq(overrides = {}) {
  return { params: {}, ...overrides } as any
}

beforeEach(() => {
  jest.clearAllMocks()
})


describe('mail.services', () => {

  describe('sendVerificationEmail', () => {
    it('retourne 400 si l’id utilisateur est manquant', async () => {
      const res = makeRes()

      await sendVerificationEmail({ id: undefined, email: 'a@test.com' }, res)

      expect(res.status).toHaveBeenCalledWith(400)
    })

    it('retourne 400 si l’id ne peut pas être converti en nombre', async () => {
      const res = makeRes()

      await sendVerificationEmail({ id: 'abc', email: 'a@test.com' }, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'ID utilisateur invalide' })
      )
    })

    it('crée la vérification, envoie l’email et retourne 200', async () => {
      const res = makeRes()
      ;(UserVerifications.create as jest.Mock).mockResolvedValue({ id: 1 })

      await sendVerificationEmail({ id: 42, email: 'a@test.com' }, res)

      expect(UserVerifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 42 })
      )
      expect(transport.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'a@test.com' })
      )
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'PENDING' })
      )
    })

    it('accepte un id fourni sous forme de chaîne numérique', async () => {
      const res = makeRes()
      ;(UserVerifications.create as jest.Mock).mockResolvedValue({ id: 1 })

      await sendVerificationEmail({ id: '42', email: 'a@test.com' }, res)

      expect(UserVerifications.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 42 })
      )
    })

    it('retourne 500 si l’envoi de l’email échoue', async () => {
      const res = makeRes()
      ;(UserVerifications.create as jest.Mock).mockResolvedValue({ id: 1 })
      ;(transport.sendMail as jest.Mock).mockRejectedValue(
        new Error('smtp down')
      )

      await sendVerificationEmail({ id: 42, email: 'a@test.com' }, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })

    it('retourne 500 si la création en base échoue', async () => {
      const res = makeRes()
      ;(UserVerifications.create as jest.Mock).mockRejectedValue(
        new Error('DB down')
      )

      await sendVerificationEmail({ id: 42, email: 'a@test.com' }, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })


  describe('verifyUser', () => {
    it('retourne 500 si aucune vérification n’est trouvée', async () => {
      const req = makeReq({ params: { userId: '1', uniqueString: 'abc' } })
      const res = makeRes()
      ;(UserVerifications.findOne as jest.Mock).mockResolvedValue(null)

      await verifyUser(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })

    it('retourne 400 et supprime la vérification si le lien a expiré', async () => {
      const req = makeReq({ params: { userId: '1', uniqueString: 'abc' } })
      const res = makeRes()
      const get = jest.fn().mockReturnValue(new Date(Date.now() - 1000))
      ;(UserVerifications.findOne as jest.Mock).mockResolvedValue({ get })

      await verifyUser(req, res)

      expect(UserVerifications.destroy).toHaveBeenCalledWith({
        where: { userId: '1' },
      })
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('expiré') })
      )
    })

    it('retourne 400 si le uniqueString ne correspond pas', async () => {
      const req = makeReq({ params: { userId: '1', uniqueString: 'wrong' } })
      const res = makeRes()
      const get = jest.fn((key) =>
        key === 'expiresAt' ? new Date(Date.now() + 60000) : 'hashed'
      )
      ;(UserVerifications.findOne as jest.Mock).mockResolvedValue({ get })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await verifyUser(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('invalide'),
        })
      )
    })

    it('retourne 404 si l’utilisateur n’est pas trouvé en base', async () => {
      const req = makeReq({ params: { userId: '1', uniqueString: 'abc' } })
      const res = makeRes()
      const get = jest.fn((key) =>
        key === 'expiresAt' ? new Date(Date.now() + 60000) : 'hashed'
      )
      ;(UserVerifications.findOne as jest.Mock).mockResolvedValue({ get })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(User.findByPk as jest.Mock).mockResolvedValue(null)

      await verifyUser(req, res)

      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('valide l’utilisateur, pose le cookie et redirige', async () => {
      const req = makeReq({ params: { userId: '1', uniqueString: 'abc' } })
      const res = makeRes()
      const get = jest.fn((key) =>
        key === 'expiresAt' ? new Date(Date.now() + 60000) : 'hashed'
      )
      const update = jest.fn()
      ;(UserVerifications.findOne as jest.Mock).mockResolvedValue({ get })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(User.findByPk as jest.Mock).mockResolvedValue({
        id: 1,
        email: 'a@test.com',
        update,
      })

      await verifyUser(req, res)

      expect(User.update).toHaveBeenCalledWith(
        { verified: true },
        { where: { id: '1' } }
      )
      expect(UserVerifications.destroy).toHaveBeenCalledWith({
        where: { userId: '1' },
      })
      expect(update).toHaveBeenCalledWith({ refreshToken: 'signed.jwt.token' })
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'signed.jwt.token',
        expect.objectContaining({ httpOnly: true })
      )
      expect(res.redirect).toHaveBeenCalledWith('/api/user/verified')
    })

    it('retourne 500 en cas d’erreur inattendue', async () => {
      const req = makeReq({ params: { userId: '1', uniqueString: 'abc' } })
      const res = makeRes()
      ;(UserVerifications.findOne as jest.Mock).mockRejectedValue(
        new Error('DB down')
      )

      await verifyUser(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
    })
  })
})
