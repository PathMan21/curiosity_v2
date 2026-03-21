import interestsData from '../Assets/interests.json'
import { User } from '../Models'
import redisClient from '../Config/redis.conf'

const CACHE_TTL = 3600 * 24 * 10
const RATE_LIMIT_DELAY = 1000    
const ARTICLES_PER_CATEGORY = 25

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}


function mapInterestsToNewsMech(interestIds) {
  return interestIds.reduce((categories, interestId) => {
    const interest = interestsData.interests.find((i) => i.id === interestId)

    if (!interest) {
      return categories
    }
    if (!interest.newsmech_category) {
      console.warn(`⚠️ Pas de newsmech_category pour "${interestId}"`)
      return categories
    }

    categories.add(interest.newsmech_category)
    return categories
  }, new Set())
}

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}


async function getFromCache(cacheKey :string) {
  try {
    const raw = await redisClient.get(cacheKey)
    if (!raw?.trim()) return null

    const parsed = JSON.parse(raw)
    return parsed?.articles?.length > 0 ? parsed.articles : null
  } catch (err) {
    console.warn(`⚠️ Erreur Redis (${cacheKey}):`, err.message)
    return null
  }
}


async function setInCache(cacheKey, category, articles) {
  try {
    await redisClient.setEx(
      cacheKey,
      CACHE_TTL,
      JSON.stringify({ category, totalResults: articles.length, articles })
    )
  } catch (err) {
    console.warn(`⚠️ Erreur écriture Redis (${cacheKey}):`, err.message)
  }
}


async function fetchCategoryFromAPI(category, baseurl, apiKey) {
  const url = new URL(`${baseurl}latest`)
  url.searchParams.set('apiKey', apiKey)
  url.searchParams.set('limit', String(ARTICLES_PER_CATEGORY))
  url.searchParams.set('category', category)
  url.searchParams.set('sourceCountry', 'us,gb,ca,au')

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} pour la catégorie "${category}"`)
  }

  const { data } = await response.json()

  return data.map((article) => ({
    title: article.title,
    description: article.description || article.excerpt,
    language: article.language,
    publishedAt: article.published_date,
    source: article.source,
    category: article.category,
    author: article.author,
    type: 'news',
    url: article.link,
  }))
}


async function resolveCategories(categories, baseurl, apiKey) {
  const allArticles = []
  const toFetch = []

  await Promise.all(
    categories.map(async (category) => {
      const cacheKey = `handle-newsmech-${category}`
      const cached = await getFromCache(cacheKey)

      if (cached) {
        allArticles.push(...cached)
      } else {
        toFetch.push(category)
      }
    })
  )

  for (let i = 0; i < toFetch.length; i++) {
    const category = toFetch[i]
    const cacheKey = `handle-newsmech-${category}`

    try {
      const articles = await fetchCategoryFromAPI(category, baseurl, apiKey)

      allArticles.push(...articles)
      await setInCache(cacheKey, category, articles)
    } catch (err) {
      console.error(`❌ Erreur fetch "${category}":`, err.message)
    }

    if (i < toFetch.length - 1) {
      await sleep(RATE_LIMIT_DELAY)
    }
  }

  return allArticles
}

// ─── Handler principal ────────────────────────────────────────────────────────

async function handleNewsmech(req, res) {
  try {
    const baseurl = process.env.BASE_URL_NEWSMECH
    const apiKey = process.env.API_KEY_NEWSMECH
    const userId = req.user.userId

    const user = await User.findOne({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ status: 'Failed', message: 'Utilisateur non trouvé' })
    }

    const userInterests = JSON.parse(user.interests)
    const newsmechCategories = mapInterestsToNewsMech(userInterests)

    if (newsmechCategories.size === 0) {
      return res.status(404).json({ status: 'Failed', message: 'Aucune catégorie newsmech trouvée' })
    }

    const shuffledCategories = shuffleArray([...newsmechCategories])

    const articles = await resolveCategories(shuffledCategories, baseurl, apiKey)

    return res.json({
      status: 'Success',
      categories: shuffledCategories,
      totalResults: articles.length,
      articles,
    })
  } catch (error) {
    console.error('❌ Erreur handleNewsmech:', error)
    return res.status(500).json({
      status: 'Failed',
      message: 'Erreur lors de la récupération des actualités',
      error: error.message,
    })
  }
}

export default handleNewsmech