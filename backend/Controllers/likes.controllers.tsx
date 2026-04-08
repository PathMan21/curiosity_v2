
import Likes from "../Models/Likes";

const toggleLikes = async (req, res) => {
    const userId = req.userId;
    const { contentId, contentType } = req.body;

    try {
        // Check if like already exists
        const existingLike = await Likes.findOne({
            where: {
                userId: userId,
                contentId: contentId,
                contentType: contentType
            }
        });

        if (existingLike) {
            // Remove like
            await existingLike.destroy();
            return res.json({
                message: 'Like removed',
                liked: false
            });
        } else {
            // Add like
            const newLike = await Likes.create({
                userId: userId,
                contentId: contentId,
                contentType: contentType
            });

            if (!newLike) {
                return res.status(500).json({
                    status: 'Failed',
                    message: 'Failed to add like',
                });
            }

            return res.json({
                message: 'Like added',
                liked: true
            });
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal server error',
        });
    }
};

const getUserLikes = async (req, res) => {
    const userId = req.userId;

    try {
        const likes = await Likes.findAll({
            where: { userId: userId },
            attributes: ['contentId', 'contentType']
        });

        // Group likes by content type
        const likesByType = likes.reduce((acc, like) => {
            if (!acc[like.contentType]) {
                acc[like.contentType] = [];
            }
            acc[like.contentType].push(like.contentId);
            return acc;
        }, {});

        return res.json({
            likes: likesByType
        });
    } catch (error) {
        console.error('Error getting user likes:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal server error',
        });
    }
};

const checkLikeStatus = async (req, res) => {
    const userId = req.userId;
    const { contentId, contentType } = req.query;

    try {
        const like = await Likes.findOne({
            where: {
                userId: userId,
                contentId: contentId,
                contentType: contentType
            }
        });

        return res.json({
            liked: !!like
        });
    } catch (error) {
        console.error('Error checking like status:', error);
        return res.status(500).json({
            status: 'Failed',
            message: 'Internal server error',
        });
    }
};

export { toggleLikes, getUserLikes, checkLikeStatus }