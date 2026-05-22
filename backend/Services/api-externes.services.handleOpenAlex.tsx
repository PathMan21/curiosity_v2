import redisClient from '../Config/redis.conf'
import interestsValues from '../Assets/interests.json'
import { isArticlesTooOld } from '../Helpers/CheckTooOld'

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

const SUBFIELD_MAPPING: Record<string, string> = {
  'ai-ml': '1702',
  'computer-science': '1705',
  'cybersecurity': '1712',
  'data-science': '2613',
  'robotics': '2207',
}
export function getAllSubfields(): string[] {
  return Object.values(SUBFIELD_MAPPING)
}
/* ---------------- UTILS ---------------- */

function mapInterestsToSubfields(interests: string[]): string[] {
  return interests
    .map(i => SUBFIELD_MAPPING[i])
    .filter(Boolean)
}

/* ---------------- CACHE ---------------- */

async function getFromCache(key: string) {
  const raw = await redisClient.get(key)
  if (!raw) return null

  try {
    const parsed = JSON.parse(typeof raw === 'string' ? raw : raw.toString())
    return parsed?.articles || null
  } catch {
    return null
  }
}

async function setCache(key: string, articles: any[]) {
  if (!articles?.length) return

  await redisClient.setEx(
    key,
    CACHE_TTL,
    JSON.stringify({ articles })
  )
}

/* ---------------- OPENALEX API ---------------- */

export async function fetchSubfieldFromAPI(subfieldId: string) {
  const currentYear = new Date().getFullYear()
  const all: any[] = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url =
      `https://api.openalex.org/works` +
      `?filter=topics.subfield.id:${subfieldId},is_oa:true,language:en` +
      `,publication_year:${currentYear - 1}-${currentYear}` +
      `&per_page=${PER_PAGE}&page=${page}`

    const res = await fetch(url, { headers: OPENALEX_HEADERS })
    if (!res.ok) break

    const data = await res.json()
    if (!data.results?.length) break

    all.push(...data.results)

    if (data.results.length < PER_PAGE) break
  }

  return all.filter(work =>
    work?.topics?.some(t =>
      Number(t?.score) >= TOPIC_SCORE_THRESHOLD
    )
  )
}

/* ---------------- RESOLVE (CACHE + API) ---------------- */

async function resolveSubfields(subfields: string[]) {
  const results: any[] = []

  for (const subfield of subfields) {
    const key = `openalex-${subfield}`

    const cached = await getFromCache(key)
    if (cached) {
      results.push(...cached)
      continue
    }

    const api = await fetchSubfieldFromAPI(subfield)

    if (api?.length) {
      await setCache(key, api)
      results.push(...api)
    }
  }

  return results
}

/* ---------------- CRON ---------------- */

export async function cronOpenAlex(interests: string[]) {
  const subfields = mapInterestsToSubfields(interests)

  for (const subfield of subfields) {
    try {
      console.log('fetch subfield =>', subfield)


      const raw = await fetchSubfieldFromAPI(subfield)

      console.log('results =>', raw.length)
          await setCache(`openalex-${subfield}`, raw)


    } catch (err) {
      console.error('cron error:', subfield, err)
    }
  }

  console.log('CRON DONE')
}

/* ---------------- CONTROLLER ---------------- */

async function handleOpenAlex(req: any, res: any) {
  try {
    const user = req.user
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const interests = JSON.parse(user.interests || '[]')
    const subfields = mapInterestsToSubfields(interests)

    if (!subfields.length) {
      return res.status(400).json({ message: 'No valid interests' })
    }

    const data = await resolveSubfields(subfields)

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
    return res.status(500).json({ message: 'Server error' })
  }
}

export default handleOpenAlex