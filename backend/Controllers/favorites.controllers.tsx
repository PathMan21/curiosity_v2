import Favorites from '../Models/Favorites'
import redisClient from '../Config/redis.conf'

const addToFavorites = async (req, res) => {
  try {
    const userId = req.user.userId
    const { articles_id } = req.body

    if (!articles_id) {
      return res.status(400).json({ message: 'article_id manquant' })
    }

    const exists = await Favorites.findOne({
      where: { user_id: userId, articles_id: articles_id },
    })

    if (exists) {
      return res.status(400).json({ message: 'Cet article est déjà en favori' })
    }

    await Favorites.create({
      articles_id: articles_id,
      user_id: userId,
    })

    res.json({
      status: 'Success',
      message: 'Favori ajouté',
    })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ status: 'Error', message: err.message })
  }
}
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId

    const favoriteRows = await Favorites.findAll({ where: { user_id: userId } })

    if (!favoriteRows.length) {
      return res.json({ favorites: [] })
    }

    res.json({ favorites: favoriteRows })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ status: 'Error', message: err.message })
  }
}
export { addToFavorites, getFavorites }
