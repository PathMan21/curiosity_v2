import User from '../Models/User'
import Article from '../Models/Article'
import interestsData from '../Assets/interests.json'
import redisClient from '../Config/redis.conf'
import { isArticlesTooOld } from '../Helpers/CheckTooOld'


const CACHE_TTL = 3600 * 24 * 30
const MAX_PAGES = 10
const PER_PAGE = 10
const TOPIC_SCORE_THRESHOLD = 0.75
const MAX_FINAL_RESULTS = 20
const MAX_AUTHORS = 5
const ABSTRACT_MAX_LENGTH = 500

const OPENALEX_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'mailto:curiosity.the.social.network@gmail.com',
}

const SUBFIELD_MAPPING = {
  'ai-ml':            { subfield: '1702', journals: ['S118930848', 'S2764455087', 'S114469174'] },
  'computer-science': { subfield: '1705', journals: ['S118930848', 'S2764455087', 'S98762135'] },
  'data-science':     { subfield: '2613', journals: ['S2764455087', 'S114469174', 'S70535770'] },
  cybersecurity:      { subfield: '1712', journals: ['S118930848', 'S2764455087'] },
  robotics:           { subfield: '2207', journals: ['S118930848', 'S70535770', 'S2764455087'] },
  mathematics:        { subfield: '2604', journals: ['S2764455087', 'S70535770'] },
  physics:            { subfield: '3109', journals: ['S125754415', 'S112505126', 'S70535770'] },
  chemistry:          { subfield: '1605', journals: ['S70535770', 'S2764455087', 'S4210170802'] },
  biology:            { subfield: '1312', journals: ['S2764455087', 'S156975444', 'S2764486067', 'S4210220386'] },
  medicine:           { subfield: '2725', journals: ['S2764455087', 'S202339397', 'S152253655', 'S156975444'] },
  neuroscience:       { subfield: '2801', journals: ['S2736105967', 'S2764455087', 'S156975444'] },
  ecology:            { subfield: '2303', journals: ['S2764455087', 'S156975444', 'S100327389', 'S4210170802'] },
  climate:            { subfield: '1902', journals: ['S100319019', 'S2764455087', 'S70535770', 'S4210193424'] },
  energy:             { subfield: '2105', journals: ['S100319019', 'S2764455087', 'S70535770'] },
  economics:          { subfield: '2002', journals: ['S2764455087', 'S70535770'] },
  finance:            { subfield: '2003', journals: ['S2764455087', 'S70535770'] },
  psychology:         { subfield: '3204', journals: ['S2736104481', 'S2764455087', 'S70535770'] },
  sociology:          { subfield: '3312', journals: ['S2764455087', 'S58730300', 'S70535770'] },
  engineering:        { subfield: '2205', journals: ['S118930848', 'S70535770', 'S2764455087'] },
  space:              { subfield: '3103', journals: ['S125754415', 'S70535770', 'S2764455087'] },
  art:                { subfield: '1213', journals: ['S2764455087', 'S4210170802'] },
  sport:              { subfield: '2732', journals: ['S2764455087', 'S70535770', 'S95457728'] },
  business:           { subfield: '1402', journals: ['S2764455087', 'S70535770'] },
}

function mapInterestsToSubfields(interestIds) {
  return interestIds.reduce((acc, id) => {
    const mapping = SUBFIELD_MAPPING[id]
    if (!mapping) {
      console.warn(`⚠️ Intérêt "${id}" non mappé`)
      return acc
    }
    acc.push({ subfield: mapping.subfield, journals: mapping.journals })
    return acc
  }, [])
}


async function getFromCache(cacheKey: string) {
  try {
    const raw = await redisClient.get(cacheKey)

    const rawString = raw.toString();
    if (!rawString.trim()) return null


    const parsed = JSON.parse(rawString);
    console.log(parsed);
    if (!parsed?.books?.length) return null


    if (isArticlesTooOld(parsed.articles)) {
      console.log(`Articles trop vieux dans cache pour "${cacheKey}"`)
      return null
    }

    return parsed.articles
  } catch (err) {
    console.warn(`⚠️ Erreur Redis lecture (${cacheKey}):`, err.message)
    return null
  }
}

async function getFromDB(subfield: string) {
  try {
    const articles = await Article.findAll({ where: { subfield } })
    if (articles.length === 0) return null

    const mapped = articles.map((a) => a.toJSON())

    if (isArticlesTooOld(mapped)) {
      console.log(`Articles OpenAlex trop vieux pour "${subfield}", réhydratation...`)
      return null
    }

    return mapped
  } catch (err) {
    console.warn(`⚠️ Erreur BDD OpenAlex (${subfield}):`, err.message)
    return null
  }
}

async function setInCache(cacheKey: string, subfield: string, articles: any[]) {
  await Article.destroy({ where: { subfield } })

  await Promise.all(
    articles.map(async (article) => {
      await Article.create({
        openAlexId: article.id,
        title: article.title,
        authors: article.authors,
        published: article.published,
        summary: article.summary,
        doi: article.doi,
        pdfUrl: article.pdfUrl,
        isOpenAccess: article.isOpenAccess,
        publicationYear: article.publicationYear,
        type: "article",
        link: article.link,
        mainTopic: article.mainTopic,
        topicScore: article.topicScore,
        concepts: article.concepts,
        subfield,
      })
    })
  )

  try {
    await redisClient.setEx(
      cacheKey,
      CACHE_TTL,
      JSON.stringify({ subfield, totalResults: articles.length, articles })
    )
    console.log(`Cache OK =>  ${cacheKey} (${articles.length} articles)`)
  } catch (err) {
    console.warn(`Erreur Redis écriture (${cacheKey}):`, err.message)
  }
}

async function fetchSubfieldFromAPI(subfieldId: string) {
  const currentYear = new Date().getFullYear()
  const allFetched = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url =
      `https://api.openalex.org/works` +
      `?filter=topics.subfield.id:${subfieldId},is_oa:true,institutions.country_code:gb,language:en` +
      `,publication_year:${currentYear - 1}-${currentYear}` +
      `&per_page=${PER_PAGE}&page=${page}&sort=cited_by_count:desc`

    const response = await fetch(url, { method: 'GET', headers: OPENALEX_HEADERS })

    if (!response.ok) {
      console.warn(`OpenAlex non OK (${subfieldId}) page ${page}:`, response.status)
      break
    }

    const data = await response.json()
    if (!data.results?.length) break

    allFetched.push(...data.results)
    if (data.results.length < PER_PAGE) break
  }

  return allFetched.filter(
    (e) => e?.topics?.some((t) => t.score >= TOPIC_SCORE_THRESHOLD)
  )
}

function reconstructAbstract(invertedIndex) {
  if (!invertedIndex || typeof invertedIndex !== 'object') return 'Résumé non disponible'

  try {
    const words = []
    for (const [word, positions] of Object.entries(invertedIndex)) {
      if (Array.isArray(positions)) {
        positions.forEach((pos) => { words[pos] = word })
      }
    }
    const abstract = words.filter(Boolean).join(' ')
    return abstract.length > ABSTRACT_MAX_LENGTH
      ? abstract.substring(0, ABSTRACT_MAX_LENGTH) + '...'
      : abstract || 'Résumé non disponible'
  } catch (err) {
    console.error('❌ Erreur reconstruction résumé:', err)
    return 'Résumé non disponible'
  }
}

function formatWork(work) {
  const relevantTopics = (work.topics || [])
    .filter((t) => t.score >= TOPIC_SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score)

  const primaryTopic = relevantTopics[0]

  return {
    id: work.id,
    title: work.title,
    authors: work.authorships
      ?.slice(0, MAX_AUTHORS)
      .map((a) => a.author?.display_name)
      .filter(Boolean) || [],
    published: work.publication_date,
    summary: work.abstract_inverted_index
      ? reconstructAbstract(work.abstract_inverted_index)
      : 'Résumé non disponible',
    openAlexUrl: work.id,
    doi: work.doi,
    pdfUrl: work.open_access?.oa_url || null,
    isOpenAccess: work.open_access?.is_oa || false,
    publicationYear: work.publication_year,
    type: 'article',
    link: work.doi
      ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}`
      : work.id,
    mainTopic: primaryTopic?.display_name || 'General',
    topicScore: primaryTopic?.score || 0,
    concepts: primaryTopic?.field?.display_name || null,
  }
}

function shuffleArray(arr: any[]) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function dedupeWorksById(works = []) {
  const seen = new Set()
  return works.filter((w) => {
    if (!w?.id || seen.has(w.id)) return false
    seen.add(w.id)
    return true
  })
}

async function resolveSubfields(subfieldItems: any[]) {
  const allResults = []
  const toFetch = []

  await Promise.all(
    subfieldItems.map(async ({ subfield }) => {
      const cacheKey = `handle-open-alex-${subfield}`

      // 1. Cache Redis
      const cached = await getFromCache(cacheKey)
      if (cached) {
        console.log(`Cache hit — ${subfield}`)
        allResults.push(...cached)
        return
      }

      // 2. BDD
      const fromDB = await getFromDB(subfield)
      if (fromDB) {
        console.log(`BDD hit — ${subfield}`)
        allResults.push(...fromDB)
        await redisClient.setEx(
          cacheKey,
          CACHE_TTL,
          JSON.stringify({ subfield, totalResults: fromDB.length, articles: fromDB })
        )
        return
      }

      // 3. API
      console.log(`Fetch API — subfield ${subfield}`)
      toFetch.push(subfield)
    })
  )

  if (toFetch.length > 0) {
    allResults.push(await checkArticles(toFetch));
  }

  return allResults
}

export async function getAllSubjects() {
  const allSubfields = Object.values(SUBFIELD_MAPPING).map((entry: any) => entry.subfield)
  console.log('OpenAlex subjects:', allSubfields)
  return allSubfields
}




export async function checkArticles(toFetch) {
  let allResults = [];
    await Promise.all(
      toFetch.map(async (subfield) => {
        const cacheKey = `handle-open-alex-${subfield}`
        const raw = await fetchSubfieldFromAPI(subfield)
        const formatted = raw.map(formatWork)

        allResults.push(...formatted)
        await setInCache(cacheKey, subfield, formatted)
        return allResults;
      })
    )
    return allResults;
}
async function handleOpenAlex(req, res) {
  try {
    const user = await User.findOne({ where: { id: req.userId } })
    if (!user) {
      return res.status(404).json({ status: 'Failed', message: 'Utilisateur non trouvé' })
    }

    const userInterests = JSON.parse(user.interests || '[]')
    const subfieldIds = mapInterestsToSubfields(userInterests)

    if (!subfieldIds.length) {
      return res.status(400).json({ status: 'Failed', message: 'Aucun intérêt valide trouvé' })
    }

    const allResults = await resolveSubfields(subfieldIds)
    const unique = dedupeWorksById(allResults)
    const articles = shuffleArray(unique).slice(0, MAX_FINAL_RESULTS)

    return res.json({
      status: 'Success',
      totalResults: allResults.length,
      filteredCount: articles.length,
      subfieldCount: subfieldIds.length,
      articles,
    })
  } catch (error) {
    console.error('Erreur handleOpenAlex:', error)
    return res.status(500).json({
      status: 'Failed',
      message: 'Erreur lors de la récupération des données OpenAlex',
      error: error.message,
    })
  }
}






export default handleOpenAlex