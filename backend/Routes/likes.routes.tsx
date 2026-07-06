import { Router } from 'express'
import bodyParser from 'body-parser'
import Likes from '../Models/Likes'
import { authentificatedUser } from '../Middlewares/user.middlewares'
import {
  toggleLikes,
  getUserLikes,
  checkLikeStatus,
} from '../Controllers/likes.controllers'

const router = Router()

// ✅ FIX: Préfixe /likes/ pour éviter les collisions avec d'autres routes /api/
// Avant : POST /api/toggle  →  Après : POST /api/likes/toggle
router.get('/favorites', authentificatedUser, async (req, res) => {
  try {
    const likes = await Likes.findAll({
      where: { userId: req.user.id },
      attributes: ['contentId', 'contentType'],
    })

    return res.status(200).json({
      favorites: likes.map((like) => ({
        contentId: like.contentId,
        contentType: like.contentType,
      })),
    })
  } catch (error) {
    return res.status(500).json({ message: 'Erreur serveur' })
  }
})

router.post(
  '/favorites',
  bodyParser.json(),
  authentificatedUser,
  async (req, res) => {
    const { articles_id } = req.body

    if (!articles_id) {
      return res.status(400).json({ message: 'articles_id requis' })
    }

    try {
      const existingLike = await Likes.findOne({
        where: {
          userId: req.user.id,
          contentId: articles_id,
          contentType: 'article',
        },
      })

      if (existingLike) {
        return res.status(409).json({ message: 'Favori existe déjà' })
      }

      const newLike = await Likes.create({
        userId: req.user.id,
        contentId: articles_id,
        contentType: 'article',
      })

      return res.status(201).json({ favorite: newLike })
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur' })
    }
  }
)

router.delete(
  '/favorites',
  bodyParser.json(),
  authentificatedUser,
  async (req, res) => {
    const { articles_id } = req.body

    if (!articles_id) {
      return res.status(400).json({ message: 'articles_id requis' })
    }

    try {
      const existingLike = await Likes.findOne({
        where: {
          userId: req.user.id,
          contentId: articles_id,
          contentType: 'article',
        },
      })

      if (!existingLike) {
        return res.status(404).json({ message: 'Favori introuvable' })
      }

      await existingLike.destroy()
      return res.status(200).json({ message: 'Favori supprimé' })
    } catch (error) {
      return res.status(500).json({ message: 'Erreur serveur' })
    }
  }
)

router.post(
  '/likes/toggle',
  bodyParser.json(),
  authentificatedUser,
  toggleLikes
)
router.get('/likes/user', authentificatedUser, getUserLikes)
router.get('/likes/status', authentificatedUser, checkLikeStatus)

export default router
