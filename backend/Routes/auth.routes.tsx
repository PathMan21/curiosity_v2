import { Router } from 'express'
import { oauthVerify } from '../Controllers/oauth.controllers'
import { oauthToken, verifyToken } from '../Controllers/oauth.controllers'
import {
  authentificatedUser,
  validateUserOauth,
} from '../Middlewares/user.middlewares'
import { updateProfile } from '../Controllers/oauth.controllers'
import bodyParser from 'body-parser'

const router = Router()

// ✅ FIX: CORS supprimé sur /google/url — le CORS global dans server.tsx (FRONTEND_URL) suffit.
// L'ancien corsOption pointait sur localhost:5173 en dur, ce qui cassait la prod.
router.get('/google/url', oauthVerify)
router.get('/google/callback', oauthToken)
router.post(
  '/complete-inscription-oauth',
  bodyParser.json(),
  validateUserOauth,
  authentificatedUser,
  updateProfile
)
router.post('/token-validate', authentificatedUser, verifyToken)

export default router
