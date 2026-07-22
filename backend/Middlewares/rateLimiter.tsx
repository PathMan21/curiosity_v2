import { Request, Response, NextFunction } from 'express'

interface RateLimitStore {
  [key: string]: { attempts: number; timestamp: number }
}

const store: RateLimitStore = {}

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 5

export const createRateLimiter = (
  key: string | ((req: Request) => string) = (req) => req.ip || 'unknown',
  maxAttempts: number = MAX_ATTEMPTS,
  windowMs: number = WINDOW_MS
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = typeof key === 'function' ? key(req) : key

    const now = Date.now()
    const userRecord = store[identifier]

    if (userRecord) {
      if (now - userRecord.timestamp > windowMs) {
        store[identifier] = { attempts: 1, timestamp: now }
        next()
      } else {
        userRecord.attempts += 1

        if (userRecord.attempts > maxAttempts) {
          return res.status(429).json({
            status: 'Failed',
            message: `Trop de tentatives. Veuillez réessayer dans ${Math.ceil(
              (userRecord.timestamp + windowMs - now) / 60000
            )} minutes`,
          })
        }

        next()
      }
    } else {
      store[identifier] = { attempts: 1, timestamp: now }
      next()
    }
  }
}

setInterval(
  () => {
    const now = Date.now()
    Object.keys(store).forEach((key) => {
      if (now - store[key].timestamp > WINDOW_MS * 2) {
        delete store[key]
      }
    })
  },
  60 * 60 * 1000
)

export default createRateLimiter
