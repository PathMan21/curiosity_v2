// ─── Imports ──────────────────────────────────────────────────────────────────

import { createRateLimiter } from '../backend/middlewares/rateLimiter'
import { Request, Response, NextFunction } from 'express'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockReq(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    ip: '127.0.0.1',
    body: {},
    ...overrides,
  }
}

function mockRes(): Partial<Response> {
  const res: any = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('rateLimiter – createRateLimiter', () => {
  let next: jest.Mock

  beforeEach(() => {
    next = jest.fn()
    // Reset Date.now pour avoir un contrôle déterministe
    jest.spyOn(Date, 'now').mockReturnValue(1000000)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('autorise la première requête', () => {
    const limiter = createRateLimiter('test-ip-1', 5, 900000)
    const req = mockReq()
    const res = mockRes()

    limiter(req as Request, res as Response, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect((res as any).status).not.toHaveBeenCalled()
  })

  it('autorise les requêtes sous la limite', () => {
    const limiter = createRateLimiter('test-ip-2', 3, 900000)
    const req = mockReq()
    const res = mockRes()

    limiter(req as Request, res as Response, next)
    limiter(req as Request, res as Response, next)
    limiter(req as Request, res as Response, next)

    expect(next).toHaveBeenCalledTimes(3)
    expect((res as any).status).not.toHaveBeenCalled()
  })

  it('bloque les requêtes au-delà de la limite avec un 429', () => {
    const limiter = createRateLimiter('test-ip-3', 2, 900000)
    const req = mockReq()
    const res = mockRes()

    // 1ère et 2ème : OK
    limiter(req as Request, res as Response, next)
    limiter(req as Request, res as Response, next)
    // 3ème : bloquée
    limiter(req as Request, res as Response, next)

    expect(next).toHaveBeenCalledTimes(2)
    expect((res as any).status).toHaveBeenCalledWith(429)
    expect((res as any).json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'Failed',
        message: expect.stringContaining('Trop de tentatives'),
      })
    )
  })

  it('réinitialise le compteur après expiration de la fenêtre', () => {
    const windowMs = 60000 // 1 minute
    const limiter = createRateLimiter('test-ip-4', 1, windowMs)
    const req = mockReq()
    const res = mockRes()

    // 1ère requête à t=1000000
    limiter(req as Request, res as Response, next)
    expect(next).toHaveBeenCalledTimes(1)

    // 2ème requête toujours dans la fenêtre → bloquée
    limiter(req as Request, res as Response, next)
    expect((res as any).status).toHaveBeenCalledWith(429)

    // Avancer le temps au-delà de la fenêtre
    ;(Date.now as jest.Mock).mockReturnValue(1000000 + windowMs + 1)

    const next2 = jest.fn()
    limiter(req as Request, res as Response, next2)
    expect(next2).toHaveBeenCalledTimes(1)
  })

  it('utilise une fonction comme clé d\'identification', () => {
    const keyFn = (req: Request) => req.body.email || 'anon'
    const limiter = createRateLimiter(keyFn, 1, 900000)

    const req1 = mockReq({ body: { email: 'user1@test.com' } })
    const req2 = mockReq({ body: { email: 'user2@test.com' } })
    const res = mockRes()

    limiter(req1 as Request, res as Response, next)
    limiter(req2 as Request, res as Response, next)

    // Deux utilisateurs différents → les deux passent
    expect(next).toHaveBeenCalledTimes(2)
  })

  it('utilise une clé string fixe', () => {
    const limiter = createRateLimiter('fixed-key', 1, 900000)
    const req = mockReq()
    const res = mockRes()

    limiter(req as Request, res as Response, next)
    limiter(req as Request, res as Response, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect((res as any).status).toHaveBeenCalledWith(429)
  })

  it('le message 429 contient le nombre de minutes restantes', () => {
    const limiter = createRateLimiter('test-ip-minutes', 1, 900000)
    const req = mockReq()
    const res = mockRes()

    limiter(req as Request, res as Response, next)
    limiter(req as Request, res as Response, next)

    expect((res as any).json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('minutes'),
      })
    )
  })
})
