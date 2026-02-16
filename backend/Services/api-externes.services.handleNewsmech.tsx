import dotenv from 'dotenv'
import interestsData from '../Assets/interests.json'
import { User } from '../Models'
import redisClient from '../Config/redis.conf'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
async function handleNewsmech(req, res) {
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

    let userInterests = JSON.parse(user.interests)

    let newsmechCategories = mapInterestsToNewsMech(userInterests)

    if (newsmechCategories.length === 0) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Aucune catégorie newsmech trouvée',
      })
    }

    let shuffledCategories = shuffleArray(newsmechCategories)
    let filteredData = []

    for (const category of shuffledCategories) {
      await sleep(5000)
      const cacheKey = `handle-newsmech-${category}`
      let cachedData = null
      try {
        const raw = await redisClient.get(cacheKey)
        if (raw && typeof raw === 'string' && raw.trim().length > 0) {
          cachedData = JSON.parse(raw)
        } else {
          console.log(`ℹ️ Aucune donnée trouvée dans Redis pour ${cacheKey}`)
        }
      } catch (err) {
        console.warn(
          `⚠️ Erreur lecture/parsing Redis (${cacheKey}):`,
          err.message
        )
      }

      if (cachedData && cachedData.articles && cachedData.articles.length > 0) {
        console.log('Données trouvées dans :', cacheKey)
        filteredData.push(...cachedData.articles)
      } else {
        const urlNews = `${baseurl}latest?apiKey=${apiKey}&limit=100&category=${category}`

        try {
          const response = await fetch(urlNews, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          })

          if (!response.ok) {
            console.error(
              `❌ Catégorie ${category} - erreur ${response.status}`
            )
          }

          const data = await response.json()

          const categoryArticles = data.data.map((article) => ({
            title: article.title,
            description: article.description || article.excerpt,
            language: article.language,
            publishedAt: article.published_date,
            source: article.source,
            category: article.category,
            author: article.author,
            type: 'article',
            url: article.link,
          }))

          filteredData.push(...categoryArticles)

          await redisClient.setEx(
            cacheKey,
            defaultExpiration,
            JSON.stringify({
              category,
              totalResults: categoryArticles.length,
              articles: categoryArticles,
            })
          )

          console.log(
            `💾 Mise en cache réussie pour ${cacheKey} (${categoryArticles.length} articles)`
          )
        } catch (err) {
          console.error(`⚠️ Erreur pour ${category}:`, err.message)
        }
      }
    }

    return res.json({
      status: 'Success',
      categories: shuffledCategories,
      articles: filteredData,
    })
  } catch (error) {
    console.error('Erreur NewsMech : ', error)
    return res.status(500).json({
      status: 'Failed',
      message: 'Erreur lors de la récupération des actualités',
      error: error.message,
    })
  }
}

function mapInterestsToNewsMech(interestIds) {
  const categories = []

  interestIds.forEach((interestId) => {
    const interest = interestsData.interests.find((i) => i.id === interestId)

    if (!interest) {
      console.warn(`interests "${interestId}" non trouvé`)
      return
    }

    if (!interest.newsmech_category) {
      console.warn(`Pas de newsmech_category pour " ${interestId} "`)
      return
    }
    categories.push(interest.newsmech_category)
  })

  return Array.from(categories)
}

function shuffleArray(categories) {
  const shuffled = [...categories]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))

    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default handleNewsmech
