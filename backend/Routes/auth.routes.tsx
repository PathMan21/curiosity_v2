import { Router } from 'express'
import { oauthVerify } from '../Controllers/oauth.controllers'
import { oauthToken, verifyToken } from '../Controllers/oauth.controllers'
import {
  authentificatedUser,
  validateUser,
  validateUserOauth,
} from '../Middlewares/user.middlewares'
import { updateProfile } from '../Controllers/oauth.controllers'
import { createUser, getCurrentUser, loginUser } from '../Controllers/user.controllers'
import bodyParser from 'body-parser'

const router = Router()

router.post('/auth/register', bodyParser.json(), validateUser, createUser)
router.post('/auth/login', bodyParser.json(), loginUser)
router.get('/auth/me', bodyParser.json(), authentificatedUser, getCurrentUser)
router.get('/google/verify', oauthVerify)
router.get('/google/url', oauthVerify)
router.get('/google/callback', oauthToken)
router.put('/auth/profile', bodyParser.json(), authentificatedUser, updateProfile)
router.post(
  '/complete-inscription-oauth',
  bodyParser.json(),
  validateUserOauth,
  authentificatedUser,
  updateProfile
)
router.post('/token-validate', authentificatedUser, verifyToken)

export default router
