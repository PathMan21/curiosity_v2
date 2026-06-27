import Likes from '../Models/Likes'

const toggleLikes = async (req, res) => {
  // ✅ FIX: req.user.id (set by authentificatedUser middleware) instead of req.userId (always undefined)
  const userId = req.user?.id
  const { contentId, contentType } = req.body

  if (!userId) {
    return res
      .status(401)
      .json({ status: 'Failed', message: 'Utilisateur non authentifié' })
  }

  // ✅ FIX: Validate inputs
  if (!contentId || !contentType) {
    return res
      .status(400)
      .json({
        status: 'Failed',
        message: 'contentId et contentType sont requis',
      })
  }

  const ALLOWED_CONTENT_TYPES = ['article', 'photo', 'news', 'book']
  if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
    return res
      .status(400)
      .json({ status: 'Failed', message: 'contentType invalide' })
  }

  try {
    const existingLike = await Likes.findOne({
      where: { userId, contentId, contentType },
    })

    if (existingLike) {
      await existingLike.destroy()
      return res.json({ message: 'Like removed', liked: false })
    } else {
      const newLike = await Likes.create({ userId, contentId, contentType })
      if (!newLike) {
        return res
          .status(500)
          .json({ status: 'Failed', message: 'Failed to add like' })
      }
      return res.json({ message: 'Like added', liked: true })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return res
      .status(500)
      .json({ status: 'Failed', message: 'Internal server error' })
  }
}

const getUserLikes = async (req, res) => {
  // ✅ FIX: req.user.id instead of req.userId
  const userId = req.user?.id

  if (!userId) {
    return res
      .status(401)
      .json({ status: 'Failed', message: 'Utilisateur non authentifié' })
  }

  try {
    const likes = await Likes.findAll({
      where: { userId },
      attributes: ['contentId', 'contentType'],
    })

    const likesByType = likes.reduce((acc, like) => {
      if (!acc[like.contentType]) acc[like.contentType] = []
      acc[like.contentType].push(like.contentId)
      return acc
    }, {})

    return res.json({ likes: likesByType })
  } catch (error) {
    console.error('Error getting user likes:', error)
    return res
      .status(500)
      .json({ status: 'Failed', message: 'Internal server error' })
  }
}

const checkLikeStatus = async (req, res) => {
  // ✅ FIX: req.user.id instead of req.userId
  const userId = req.user?.id
  const { contentId, contentType } = req.query

  if (!userId) {
    return res
      .status(401)
      .json({ status: 'Failed', message: 'Utilisateur non authentifié' })
  }

  if (!contentId || !contentType) {
    return res
      .status(400)
      .json({
        status: 'Failed',
        message: 'contentId et contentType sont requis',
      })
  }

  try {
    const like = await Likes.findOne({
      where: { userId, contentId, contentType },
    })
    return res.json({ liked: !!like })
  } catch (error) {
    console.error('Error checking like status:', error)
    return res
      .status(500)
      .json({ status: 'Failed', message: 'Internal server error' })
  }
}

export { toggleLikes, getUserLikes, checkLikeStatus }
