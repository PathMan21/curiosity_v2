
import Likes from "../Models/Likes";

const addLikes = async (req, res) => {

    const userId = req.userId

    const { articleId, type } = req.body;

    let newLikes = await Likes.create({
        userId: userId,
        articleId: articleId,
        type: type
    })
    if (!newLikes) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Likes echoué',
      })
    } else {
    res.json({
      status: 'Success'
    })
    }
    
}

export { addLikes }