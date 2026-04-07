import { Router } from 'express'
import bodyParser from 'body-parser'
import { authentificatedUser } from '../Middlewares/user.middlewares'
import { addLikes } from '../Controllers/likes.controllers'



const router = Router()


// Ajouter les likes
router.post(
  '/add',
  bodyParser.json(),
  authentificatedUser,
  addLikes
)


// Récupérer les likes sur la page
// router.get(
//   '/get',
//   bodyParser.json(),
//   authentificatedUser,
//   getLikes
// )

export default router
