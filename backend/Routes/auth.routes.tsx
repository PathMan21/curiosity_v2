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
