import { Router } from 'express'
// import { createUser } from './contoller';
import {
  validateUser,
  authentificatedUser,
} from '../Middlewares/user.middlewares'
import validateByMail from '../Middlewares/mail.middlewares'
import bodyParser from 'body-parser'
import {
  createUser,
  loginUser,
  logoutUser,
  refresh,
  updatedProfile,
  getCurrentUser,
} from '../Controllers/user.controllers'
import { verifiedPage, verifyUser } from '../Services/mail.services'
const router = Router()

router.post('/', bodyParser.json(), validateUser, validateByMail, createUser)
router.post('/login', bodyParser.json(), loginUser)
router.post('/logout', bodyParser.json(), logoutUser)
router.post('/refresh-token', refresh)
router.get('/verify/:userId/:uniqueString', verifyUser)
router.get('/verified', verifiedPage)
router.get('/me', bodyParser.json(), authentificatedUser, getCurrentUser)

router.post(
  '/updated-profile',
  bodyParser.json(),
  authentificatedUser,
  updatedProfile
)

export default router
