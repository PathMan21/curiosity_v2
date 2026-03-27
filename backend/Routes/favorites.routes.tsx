import { Router } from 'express'
import bodyParser from 'body-parser'
import { authentificatedUser } from '../Middlewares/user.middlewares'
const router = Router()

router.post('/articles', bodyParser.json(), authentificatedUser)

router.post(
  '/getArticles',
  bodyParser.json(),
  authentificatedUser,
)

export default router
