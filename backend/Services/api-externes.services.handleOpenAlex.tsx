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

const INTERESTS_MAP: Record<string, string> = {
  'ai-ml': '1702',
  'computer-science': '1705',
  'cybersecurity': '1712',
  'data-science': '2613',
  'robotics': '2207',
}
export function getAllSubfields(): string[] {
  return Object.values(INTERESTS_MAP)
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
    const parsed = JSON.parse(raw.toString())
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

  // Extract the most relevant topic
  const articlesArray = articles.map(art => {
    const topTopic = art.topics?.find(t => 
      Number(t?.score) >= TOPIC_SCORE_THRESHOLD
    ) || art.topics?.[0]

    return createArticleSchema.parse({
      openAlexId: art.id?.split('/').pop() || art.id,
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
    await Article.bulkCreate(articlesArray, { transaction: t })

    await t.commit()

    await redisClient.setEx(
      cacheKey,
      CACHE_TTL,
      JSON.stringify({ articlesArray })
    )
  } catch (err) {
    await t.rollback()
    console.error('[CRON] OpenAlex cache write failed:', err instanceof Error ? err.message : err)
  }
}


/* ---------------- OPENALEX API ---------------- */

export async function fetchInterestFromAPI(interestID) {

  const currentYear = new Date().getFullYear()
  const all = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url =
      `https://api.openalex.org/works` +
      `?filter=topics.subfield.id:${interestID},is_oa:true,language:en` +
      `,publication_year:${currentYear - 1}-${currentYear}` +
      `&per_page=${PER_PAGE}&page=${page}`

    const res = await fetch(url,
      {
        headers: OPENALEX_HEADERS
      })
    if (!res.ok) {
      break
    }

    const data = await res.json()
    if (!data.results?.length) {
      break
    }

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

export async function checkArticles(queries) {
  const resultsInfo = { reussis: 0, cache: 0, db: 0, errors: 0 }
  const results = [] 

  for (const interest of queries) {
    try {
      const cacheKey = `openalex-${interest}`

      const cached = await getFromCache(cacheKey)
      if (cached && !isArticlesTooOld(cached)) {
        resultsInfo.cache++
        results.push(...cached.articlesArray)
        continue
      }

      const dbArticles = await getFromDB(interest)
      if (dbArticles && !isArticlesTooOld(dbArticles)) {
        resultsInfo.db++
        results.push(...dbArticles)
        continue
      }

      const articles = await fetchInterestFromAPI(interest)
      if (!articles.length) {
        continue
      }

      await setCache(cacheKey, interest, articles)
      results.push(...articles) 
      resultsInfo.reussis++

    } catch (err) {
      resultsInfo.errors++
      console.error(`[CRON] OpenAlex error for "${interest}":`, err instanceof Error ? err.message : err)
    }
  }

  console.log(`[CRON] OpenAlex: cached=${resultsInfo.cache}, db=${resultsInfo.db}, synced=${resultsInfo.reussis}, errors=${resultsInfo.errors}`)
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

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' })
    }

    const interestsRaw = JSON.parse(user.interests)
    const interests = mapInterestsToSubfields(interestsRaw)

    if (!interests.length) {
      return res.status(400).json({ message: 'Aucun interet utilisateur' })
    }

      const data = await checkArticles(interests)

    const unique = Array.from(
      new Map(data.map(a => [a.id, a])).values()
    )

    const final = unique
      .sort(() => Math.random() - 0.5)
      .slice(0, MAX_FINAL_RESULTS)

    return res.json({
      totalResults: data.length,
      articles: final,
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: `Erreur serveur => ${err}` })
  }
}

export default handleOpenAlex