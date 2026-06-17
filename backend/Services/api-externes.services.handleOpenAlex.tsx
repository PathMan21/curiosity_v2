import redisClient from '../Config/redis.conf'
import interestsValues from '../Assets/interests.json'
import { isArticlesTooOld } from '../Helpers/CheckTooOld'
import Article from '../Models/Article'
import { createArticleSchema } from '../dtos/Article'
import sequelizeDb from '../Config/dbInit'

/* ---------------- CONFIG ---------------- */

const CACHE_TTL = 3600 * 24 * 30
const MAX_PAGES = 3
const PER_PAGE = 10
const TOPIC_SCORE_THRESHOLD = 0.75
const MAX_FINAL_RESULTS = 20

const OPENALEX_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'mailto:curiosity.the.social.network@gmail.com',
}

/* ---------------- INTERESTS (5 UNIQUEMENT) ---------------- */
const INTERESTS_MAP = {
  'ai-ml': '1702',
  'computer-science': '1705',
  'cybersecurity': '1712',
  'data-science': '2613',
  'robotics': '2207',
  'computer-vision': '1703',
  'nlp': '1704',
  'computer-networks': '1708',
  'software-engineering': '1710',
  'databases': '1706',
  'distributed-systems': '1709',
  'quantum-computing': '3107',
  'bioinformatics': '1101',
}
export function getAllSubfields(): string[] {
  let subfield = Object.values(INTERESTS_MAP)
  console.log("subfield ", subfield)
  return subfield
}
/* ---------------- UTILS ---------------- */

function mapInterestsToSubfields(interests) {
  return interests
    .map(i => INTERESTS_MAP[i])
    .filter(Boolean)
}

/* ---------------- CACHE ---------------- */

async function getFromCache(key) {
  const raw = await redisClient.get(key)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    if (parsed?.articles) {
      return parsed;
    } else {
      return null;
    }
  } catch {
    return null
  }
}
async function setCache(
  cacheKey,
  interest,
  articles
) {
  if (!articles?.length) {
    return
  }

  const articlesArray = articles.map(art => {
    const topTopic = art.topics?.find(t => {
      Number(t?.score) >= TOPIC_SCORE_THRESHOLD

    }) || art.topics?.[0]

    return createArticleSchema.parse({
      openAlexId: art.id,
      title: art.title,
      authors: art.authorships?.map(a => a.author?.display_name).filter(Boolean),
      published: art.publication_date,
      summary: art.abstract,
      doi: art.doi,
      pdfUrl: art.open_access?.oa_url,
      isOpenAccess: art.open_access?.is_oa || false,
      publicationYear: art.publication_year,
      type: 'article',
      link: art.canonical_url,
      mainTopic: topTopic?.display_name || 'Unknown',
      topicScore: Number(topTopic?.score) || 0,
      concepts: art.concepts?.map(c => c.display_name).filter(Boolean),
      subfield: interest,
    })
  })

  try {
    await redisClient.setEx(
      cacheKey,
      CACHE_TTL,
      JSON.stringify(articlesArray)
    )
  } catch (err) {
    console.error('CRON openalex cache error => ', err)
  }
}


async function setDbAndCache(
  cacheKey,
  interest,
  articles
) {
  if (!articles?.length) {
    return
  }
  console.log("set db and cache")
  const articlesArray = articles.map(art => {
    const topTopic = art.topics?.find(t => {
      Number(t?.score) >= TOPIC_SCORE_THRESHOLD

    }) || art.topics?.[0]

    return createArticleSchema.parse({
      openAlexId: art.id,
      title: art.title,
      authors: art.authorships?.map(a => a.author?.display_name).filter(Boolean),
      published: art.publication_date,
      summary: art.abstract,
      doi: art.doi,
      pdfUrl: art.open_access?.oa_url,
      isOpenAccess: art.open_access?.is_oa || false,
      publicationYear: art.publication_year,
      type: 'article',
      link: art.canonical_url,
      mainTopic: topTopic?.display_name || 'Unknown',
      topicScore: Number(topTopic?.score) || 0,
      concepts: art.concepts?.map(c => c.display_name).filter(Boolean),
      subfield: interest,
    })
  })

  const t = await sequelizeDb.transaction()

  try {
    await Article.destroy({ where: { subfield: interest }, transaction: t })
    await Article.bulkCreate(articlesArray, {
      transaction: t,
      ignoreDuplicates: true,
      logging: false
    })

    await t.commit()

    await redisClient.setEx(
      cacheKey,
      CACHE_TTL,
      JSON.stringify(articlesArray)
    )
  } catch (err) {
    await t.rollback()
    console.error('CRON openalex error => ', err)
  }
}

/* ---------------- OPENALEX API ---------------- */

export async function fetchInterestFromAPI(interestID) {

  const currentYear = new Date().getFullYear()
  const all = []

  // Validate interestID to prevent injection
  if (!/^\d+$/.test(interestID)) {
    console.error('Invalid interest ID format:', interestID)
    return []
  }

  for (let page = 1; page <= MAX_PAGES; page++) {
    const params = new URLSearchParams({
      filter: `topics.subfield.id:${interestID},is_oa:true,language:en,publication_year:${currentYear - 1}-${currentYear}`,
      per_page: String(PER_PAGE),
      page: String(page),
    })
    
    const url = `https://api.openalex.org/works?${params.toString()}`

    const res = await fetch(url,
      {
        headers: OPENALEX_HEADERS
      })
    if (!res.ok) {
      break
    }

    const data = await res.json()

    all.push(...data.results)

  }

  return all.filter(work =>
    work.topics.some(t =>
      Number(t?.score) >= TOPIC_SCORE_THRESHOLD
    )
  )
}

/* ---------------- CHECK - COMBINE API ET DB---------------- */

export function getAllOpenAlexQueries() {
  return Object.values(INTERESTS_MAP)
}

export async function checkArticles(int) {
  const resultsInfo = { reussis: 0, cache: 0, db: 0, errors: 0 }
  const results = []

  try {
    const cacheKey = `openalex-${int}`

    const cached = await getFromCache(cacheKey)
    if (cached && !isArticlesTooOld(cached)) {
      resultsInfo.cache++
      results.push(...cached) 
      return results
    }

    const dbArticles = await getFromDB(int)
    if (dbArticles && !isArticlesTooOld(dbArticles)) {
      resultsInfo.db++
      results.push(...dbArticles)
      await setCache(cacheKey, int, dbArticles)
      return results
    }

    const articles = await fetchInterestFromAPI(int)
    if (!articles.length) {
      return results
    }

    await setDbAndCache(cacheKey, int, articles)
    results.push(...articles)
    resultsInfo.reussis++

  } catch (err) {
    resultsInfo.errors++
    console.error(`CRON OpenAlex error pour "${int}" =>`, "error => ", err)
  }

  console.log(
    `CRON OpenAlex: caché ${resultsInfo.cache}, db ${resultsInfo.db}, réussis ${resultsInfo.reussis}, errors ${resultsInfo.errors}`
  )

  return results
}

async function getFromDB(interest) {
  const articles = await Article.findAll({ where: { subfield: interest } })
  if (!articles.length) {
    return null
  }
  const mapped = articles.map(article => article.toJSON())

  return mapped
}

/* ---------------- CONTROLLER ---------------- */

async function handleOpenAlex(req, res) {
  try {
    const user = req.user

    let interestsRaw = user.interests
    
    // Handle interests if it's a string (from DB) or array (from response)
    if (typeof interestsRaw === 'string') {
      try {
        interestsRaw = JSON.parse(interestsRaw)
      } catch (e) {
        console.error('Error parsing interests:', e)
        return res.status(400).json({ message: 'Format des intérêts invalide' })
      }
    }
    
    if (!Array.isArray(interestsRaw) || interestsRaw.length === 0) {
      return res.status(400).json({ message: 'Aucun intérêt défini' })
    }

    const interests = mapInterestsToSubfields(interestsRaw)
    
    if (interests.length === 0) {
      return res.status(400).json({ message: 'Intérêts non valides' })
    }

    let results = []

    for (const interest of interests) {
      const cacheKey = `openalex-${interest}`

      const cached = await getFromCache(cacheKey)

      if (cached) {
        results.push(...cached)
        continue
      }

      const dbArticles = await getFromDB(interest)

      if (dbArticles) {
        results.push(...dbArticles)
      }
    }

    const unique = Array.from(
      new Map(results.map(a => [a.openAlexId, a])).values()
    )

    return res.json({
      totalResults: unique.length,
      articles: unique
        .sort(() => Math.random() - 0.5)
        .slice(0, MAX_FINAL_RESULTS)
    })

  } catch (err) {
    console.error('handleOpenAlex error:', err)
    return res.status(500).json({
      message: 'Erreur serveur'
    })
  }
}

export default handleOpenAlex