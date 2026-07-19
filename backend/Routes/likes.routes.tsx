import { Router } from 'express'
import bodyParser from 'body-parser'
import { authentificatedUser } from '../Middlewares/user.middlewares'
import { toggleLikes, getUserLikes, checkLikeStatus } from '../Controllers/likes.controllers'

const router = Router()

// ✅ FIX: Préfixe /likes/ pour éviter les collisions avec d'autres routes /api/
// Avant : POST /api/toggle  →  Après : POST /api/likes/toggle
router.post('/likes/toggle', bodyParser.json(), authentificatedUser, toggleLikes)
router.get('/likes/user', authentificatedUser, getUserLikes)
router.get('/likes/status', authentificatedUser, checkLikeStatus)

export default router
