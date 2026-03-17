
import dotenv from 'dotenv'
import interestsData from '../Assets/interests.json'
import { User } from '../Models'
import redisClient from '../Config/redis.conf'



async function handleOpenLibrary(req, res) {
  try {
    const baseurl = process.env.BASE_URL_NEWSMECH
    const apiKey = process.env.API_KEY_NEWSMECH
    const userJWT = req.user.userId
    const defaultExpiration = 3600 * 24 * 2

    const user = await User.findOne({ where: { id: userJWT } })
    if (!user) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Utilisateur non trouvé',
      })
    }
    console.log(JSON.parse(user.interests))

    let userInterests = JSON.parse(user.interests);

} catch(err) {



}

}