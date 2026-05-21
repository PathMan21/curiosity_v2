import User from '../Models/User'
import Article from '../Models/Article'
import redisClient from '../Config/redis.conf'
import sequelizeDb from '../Config/dbInit'

import { isArticlesTooOld } from '../Helpers/CheckTooOld'
import { createArticleSchema } from '../dtos/Article'

const CACHE_TTL = 3600 * 24 * 30
const MAX_PAGES = 3
const PER_PAGE = 10
const TOPIC_SCORE_THRESHOLD = 0.75
const MAX_FINAL_RESULTS = 20
const MAX_AUTHORS = 5
const ABSTRACT_MAX_LENGTH = 500

const OPENALEX_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'mailto:curiosity.the.social.network@gmail.com',
}

/* ---------------- MAPPING ---------------- */

const SUBFIELD_MAPPING = {
  'ai-ml': { subfield: '1702', journals: ['S118930848'] },
  'computer-science': { subfield: '1705', journals: ['S118930848'] },
  'data-science': { subfield: '2613', journals: ['S2764455087'] },
  cybersecurity: { subfield: '1712', journals: ['S118930848'] },
  robotics: { subfield: '2207', journals: ['S118930848'] },
  mathematics: { subfield: '2604', journals: ['S2764455087'] },
  physics: { subfield: '3109', journals: ['S125754415'] },
  chemistry: { subfield: '1605', journals: ['S70535770'] },
  biology: { subfield: '1312', journals: ['S2764455087'] },
  medicine: { subfield: '2725', journals: ['S2764455087'] },
  neuroscience: { subfield: '2801', journals: ['S2736105967'] },
  ecology: { subfield: '2303', journals: ['S2764455087'] },
  climate: { subfield: '1902', journals: ['S100319019'] },
  energy: { subfield: '2105', journals: ['S100319019'] },
  economics: { subfield: '2002', journals: ['S2764455087'] },
  finance: { subfield: '2003', journals: ['S2764455087'] },
  psychology: { subfield: '3204', journals: ['S2736104481'] },
  sociology: { subfield: '3312', journals: ['S2764455087'] },
  engineering: { subfield: '2205', journals: ['S118930848'] },
  space: { subfield: '3103', journals: ['S125754415'] },
  art: { subfield: '1213', journals: ['S2764455087'] },
  sport: { subfield: '2732', journals: ['S2764455087'] },
  business: { subfield: '1402', journals: ['S2764455087'] },
}

/* ---------------- UTILS ---------------- */

function mapInterestsToSubfields(interests: string[]) {
  return interests
    .map(i => SUBFIELD_MAPPING[i])
    .filter(Boolean)
}

function shuffleArray(arr: any[]) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function copyChecked(articles: any[]) {
  const seen = new Set()

  return articles.filter(a => {
    if (!a?.id) return false
    if (seen.has(a.id)) return false
    seen.add(a.id)
    return true
  })
}

/* ---------------- CACHE ---------------- */

async function getFromCache(cacheKey: string) {
  try {
    const raw = await redisClient.get(cacheKey)
    if (!raw) return null

    const parsed = JSON.parse(raw)

    if (!parsed?.articles?.length) return null

    if (isArticlesTooOld(parsed.articles)) return null

    return parsed.articles
  } catch (err) {
    console.warn('Redis error:', err)
    return null
  }
}

/* ---------------- DB ---------------- */

async function getFromDB(subfield: string) {
  try {
    const articles = await Article.findAll({ where: { subfield } })
    if (!articles?.length) return null

    const mapped = articles.map(a => a.toJSON())

    if (isArticlesTooOld(mapped)) return null

    return mapped
  } catch (err) {
    console.warn('DB error:', err)
    return null
  }
}

/* ---------------- CACHE WRITE ---------------- */

async function setInCache(cacheKey: string, subfield: string, articles: any[]) {
  if (!articles?.length) return

  try {
    const validatedArticles = articles.map(article =>
      createArticleSchema.parse({
        openAlexId: article.openAlexUrl,
        title: article.title,
        authors: article.authors,
        published: article.published,
        summary: article.summary,
        doi: article.doi,
        pdfUrl: article.pdfUrl,
        isOpenAccess: article.isOpenAccess,
        publicationYear: article.publicationYear,
        type: 'article',
        link: article.link,
        mainTopic: article.mainTopic,
        topicScore: article.topicScore,
        concepts: article.concepts,
        subfield,
      })
    )

    await sequelizeDb.transaction(async t => {
      await Article.destroy({
        where: { subfield },
        transaction: t,
      })

      await Article.bulkCreate(validatedArticles, {
        transaction: t,
      })
    })

    await redisClient.setEx(
      cacheKey,
      CACHE_TTL,
      JSON.stringify({
        subfield,
        articles: validatedArticles,
      })
    )
  } catch (err) {
    console.error('Cache write error:', err)
  }
}

/* ---------------- API ---------------- */

async function fetchSubfieldFromAPI(subfieldId: string) {
  const currentYear = new Date().getFullYear()
  const all = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url =
      `https://api.openalex.org/works` +
      `?filter=topics.subfield.id:${subfieldId},is_oa:true,language:en` +
      `,publication_year:${currentYear - 1}-${currentYear}` +
      `&per_page=${PER_PAGE}&page=${page}&sort=cited_by_count:desc`

    const res = await fetch(url, {
      headers: OPENALEX_HEADERS,
    })

    if (!res.ok) break

    const data = await res.json()

    if (!data.results?.length) break

    all.push(...data.results)

    if (data.results.length < PER_PAGE) break
  }

  return all.filter(work =>
    work?.topics?.some(t => t.score >= TOPIC_SCORE_THRESHOLD)
  )
}

/* ---------------- FORMAT ---------------- */

function reconstructAbstract(index: any) {
  if (!index) return 'Résumé non disponible'

  try {
    const words: string[] = []

    for (const [word, positions] of Object.entries(index)) {
      ;(positions as number[]).forEach(pos => {
        words[pos] = word
      })
    }

    const text = words.filter(Boolean).join(' ')

    return text.length > ABSTRACT_MAX_LENGTH
      ? text.slice(0, ABSTRACT_MAX_LENGTH) + '...'
      : text || 'Résumé non disponible'
  } catch {
    return 'Résumé non disponible'
  }
}

function formatWork(work: any) {
  const topics = (work.topics || [])
    .filter((t: any) => t.score >= TOPIC_SCORE_THRESHOLD)
    .sort((a: any, b: any) => b.score - a.score)

  const main = topics[0]

  return {
    id: work.id,
    title: work.title,
    authors: work.authorships
      ?.slice(0, MAX_AUTHORS)
      .map((a: any) => a.author?.display_name)
      .filter(Boolean),
    published: work.publication_date,
    summary: reconstructAbstract(work.abstract_inverted_index),
    openAlexUrl: work.id,
    doi: work.doi,
    pdfUrl: work.open_access?.oa_url || null,
    isOpenAccess: work.open_access?.is_oa || false,
    publicationYear: work.publication_year,
    type: 'article',
    link: work.doi
      ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}`
      : work.id,
    mainTopic: main?.display_name || 'General',
    topicScore: main?.score || 0,
    concepts: main?.field?.display_name || null,
  }
}

/* ---------------- RESOLVE ---------------- */

async function resolveSubfields(subfields: any[]) {
  const results: any[] = []
  const toFetch: string[] = []

  await Promise.all(
    subfields.map(async ({ subfield }) => {
      const key = `openalex-${subfield}`

      const cached = await getFromCache(key)
      if (cached) {
        results.push(...cached)
        return
      }

      const db = await getFromDB(subfield)
      if (db) {
        results.push(...db)

        await redisClient.setEx(
          key,
          CACHE_TTL,
          JSON.stringify({ subfield, articles: db })
        )

        return
      }

      toFetch.push(subfield)
    })
  )

  if (toFetch.length) {
    const fetched = await checkArticles(toFetch)
    results.push(...fetched)
  }

  return results
}

/* ---------------- FETCH + SAVE ---------------- */

export async function checkArticles(subfields: string[]) {
  const results = await Promise.all(
    subfields.map(async subfield => {
      const raw = await fetchSubfieldFromAPI(subfield)
      const formatted = raw.map(formatWork)

      await setInCache(`openalex-${subfield}`, subfield, formatted)

      return formatted
    })
  )

  return results.flat()
}

/* ---------------- CONTROLLER ---------------- */

async function handleOpenAlex(req: any, res: any) {
  try {
    console.log("arrivé - open alex")
    const user = req.user
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const interests = JSON.parse(user.interests || '[]')

    const mapped = mapInterestsToSubfields(interests)
    if (!mapped.length) {
      return res.status(400).json({ message: 'No valid interests' })
    }

    const data = await resolveSubfields(mapped)

    const unique = copyChecked(data)
    const final = shuffleArray(unique).slice(0, MAX_FINAL_RESULTS)

    return res.json({
      totalResults: data.length,
      filteredCount: final.length,
      subfieldCount: mapped.length,
      articles: final,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

export default handleOpenAlex