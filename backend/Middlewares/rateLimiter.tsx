import { Request, Response, NextFunction } from 'express'

// ✅ CORRECTION: Ajouter rate limiting pour éviter les attaques par brute force
interface RateLimitStore {
  [key: string]: { attempts: number; timestamp: number }
}

const store: RateLimitStore = {}

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5 // Max 5 tentatives par fenêtre

/**
 * Rate limiter middleware - limite le nombre de tentatives par IP/email
 * @param key - la clé pour identifier la requête (IP, email, etc.)
 * @param maxAttempts - nombre maximum de tentatives autorisées
 * @param windowMs - durée de la fenêtre en ms
 */
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
        // Fenêtre expirée, réinitialiser
        store[identifier] = { attempts: 1, timestamp: now }
        next()
      } else {
        // Fenêtre active
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
      // Première tentative
      store[identifier] = { attempts: 1, timestamp: now }
      next()
    }
  }
}

// Nettoyer les anciennes entrées toutes les heures
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
