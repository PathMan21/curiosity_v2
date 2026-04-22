import { Router } from 'express'
import bodyParser from 'body-parser'
import { authentificatedUser } from '../Middlewares/user.middlewares'
import { toggleLikes, getUserLikes, checkLikeStatus } from '../Controllers/likes.controllers'

const router = Router()

// Toggle likes (add/remove)
router.post(
  '/toggle',
  bodyParser.json(),
  authentificatedUser,
  toggleLikes
)

// Get user's likes
router.get(
  '/user',
  authentificatedUser,
  getUserLikes
)

// Check if user has liked specific content
router.get(
  '/status',
  authentificatedUser,
  checkLikeStatus
)

export default router
