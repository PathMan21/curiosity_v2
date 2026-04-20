import { Router } from 'express'
import handleOpenAlex from '../Services/api-externes.services.handleOpenAlex'
import handleNewsmech from '../Services/api-externes.services.handleNewsmech'
import handleUnsplash from '../Services/api-externes.services.handleUnsplash'
import handleOpenLibrary from '../Services/api-externes.services.handleOpenLibrary'

import { authentificatedUser } from '../Middlewares/user.middlewares'
const router = Router()

// router.get('/images/', authentificatedUser, handleUnsplash)
// router.get('/news/', authentificatedUser, handleNewsmech)
router.get('/articles/', authentificatedUser, handleOpenAlex)
// router.get('/books/', authentificatedUser, handleOpenLibrary)

export default router
