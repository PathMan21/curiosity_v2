import interestsData from '../Assets/interests.json'
import { User } from '../Models'
import News from '../Models/News'
import redisClient from '../Config/redis.conf'

const CACHE_TTL = 3600 * 24 * 10
const RATE_LIMIT_DELAY = 1000
const ARTICLES_PER_CATEGORY = 25
const MAX_ARTICLE_AGE_DAYS = 7

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function mapInterestsToNewsMech(interestIds) {
  
  return interestIds.reduce((categories, interestId) => {
    const interest = interestsData.interests.find((i) => i.id === interestId)

    if (!interest) return categories
    if (!interest.newsmech_category) {
      console.warn(`⚠️ Pas de newsmech_category pour "${interestId}"`)
      return categories
    }

    categories.add(interest.newsmech_category)
    return categories
  }, new Set<string>())
}

function shuffleArray(arr) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}


function isArticlesTooOld(articles: any[]): boolean {
  if (!articles || articles.length === 0) return true

  const limitDate = new Date()
  limitDate.setDate(limitDate.getDate() - MAX_ARTICLE_AGE_DAYS)

  const tooOldCount = articles.filter((a) => {
    const publishedAt = new Date(a.publishedAt)
    return publishedAt < limitDate
  }).length

  // Si plus de la moitié des articles sont trop vieux => on le considère périmé
  return tooOldCount > articles.length / 2
}

// Cache reddis 

async function getFromCache(cacheKey: string) {
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

// On récupère de la bdd

async function getFromDB(category) {
  try {
    const articles = await News.findAll({ where: { category } })

    if (articles.length === 0) {
      return null
    }

    const mapped = articles.map((a) => a.toJSON())

    // Si les articles sont trop vieux => on force un appel API
    if (isArticlesTooOld(mapped)) {
      console.log(`Les articles sont trop vieux => plus de 7 jours`)
      return null
    }

    return mapped
  } catch (err) {
    console.warn(`Erreur BDD pour (${category}) => `, err.message)
    return null
  }
}

// Sauvegarde du cache et suppression des articles trop vieux

async function setInCache(cacheKey, category, articles) {
  // On supprime les anciens articles de la catégorie avant d'insérer
  await News.destroy({ where: { category } })

  await Promise.all(
    articles.map(async (article) => {
      await News.create({
        title: article.title,
        url: article.url,
        category: article.category,
        description: article.description,
        publishedAt: article.publishedAt,
        source: article.source,
        author: article.author,
        type: "news"
      })
    })
  )

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

// Appel Api

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

// Pour tout les articles non trouvés => Tri avant appel api

async function callApi(toFetch, baseurl, apiKey) {
  const articles = []

  for (let i = 0; i < toFetch.length; i++) {
    const category = toFetch[i]
    const cacheKey = `handle-newsmech-${category}`

    try {
      const fetched = await fetchCategoryFromAPI(category, baseurl, apiKey)

      articles.push(...fetched)
      await setInCache(cacheKey, category, fetched)
    } catch (err) {
      console.error(`Erreur ne trouve pas => "${category}" : `, err.message)
    }

    if (i < toFetch.length - 1) {
      await sleep(RATE_LIMIT_DELAY)
    }
  }

  return articles
}

// Gestion du cache, si on ne troyve pas dans le cache on cherche dans la bdd etc...

async function resolveCategories(categories ,baseurl, apiKey) {
  const allArticles = []
  const toFetch = []

  await Promise.all(
    categories.map(async (category) => {
      const cacheKey = `handle-newsmech-${category}`

      // 1. On cherche dans le cache reddis
      const cached = await getFromCache(cacheKey)
      if (cached) {
        console.log("on récupère du cache");
        allArticles.push(...cached)
        return
      }

      // 2. On cherche dans la BDD si il n'y a pas dans reddis
      const fromDB = await getFromDB(category)
      if (fromDB) {
        console.log("on récupère de la bdd parce que pas de cache");
        allArticles.push(...fromDB)

        await redisClient.setEx(
          cacheKey,
          CACHE_TTL,
          JSON.stringify({ category, totalResults: fromDB.length, articles: fromDB })
        )
        return
      }

      // 3. Ni en cache && bdd donc on appel l'api
      console.log("Ni en bdd ni en cache");
      toFetch.push(category)
    })
  )
  // si on ne trouve rien dans redis et la bdd on appel l'api 
  if (toFetch.length > 0) {
    const apiArticles = await callApi(toFetch, baseurl, apiKey)
    allArticles.push(...apiArticles)
  }

  return allArticles
}

// Fonction principale => gère tout les appel et endpoint de la route
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
      return res.status(404).json({ status: 'Failed', message: 'Aucune catégories newsmech trouvées' })
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
    console.log("error => ", error);
  }
}

export default handleNewsmech