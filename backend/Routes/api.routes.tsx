import { Router } from 'express'
import handleOpenAlex from '../Services/api-externes.services.handleOpenAlex'
import handleUnsplash from '../Services/api-externes.services.handleUnsplash'

import { authentificatedUser } from '../Middlewares/user.middlewares'
const router = Router()

router.get('/photos/', authentificatedUser, handleUnsplash)
// router.get('/news/', authentificatedUser, handleNewsmech)
router.get('/articles/', authentificatedUser, handleOpenAlex)
router.get('/openalex', authentificatedUser, handleOpenAlex)
// router.get('/books/', authentificatedUser, handleOpenLibrary)

export default router
