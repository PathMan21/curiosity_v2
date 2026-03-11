import { Router } from 'express'
import handleOpenAlex from '../Services/api-externes.services.handleOpenAlex'
import handleNewsmech from '../Services/api-externes.services.handleNewsmech'
import handleUnsplash from '../Services/api-externes.services.handleUnsplash'
import { authentificatedUser } from '../Middlewares/user.middlewares'
const router = Router()

router.get('/images/', handleUnsplash)
router.get('/news/', handleNewsmech)
router.get('/articles/', handleOpenAlex)

export default router
