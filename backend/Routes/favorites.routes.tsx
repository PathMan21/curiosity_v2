import { Router } from 'express'
import bodyParser from 'body-parser'
import { authentificatedUser } from '../Middlewares/user.middlewares'
import {
  addToFavorites,
  getFavorites,
} from '../Controllers/favorites.controllers'
const router = Router()

router.post('/articles', bodyParser.json(), authentificatedUser, addToFavorites)

router.post(
  '/getArticles',
  bodyParser.json(),
  authentificatedUser,
  getFavorites
)

export default router
