import User from '../Models/User'
import Photo from '../Models/Photo'
import redisClient from '../Config/redis.conf'
import sequelizeDb from '../Config/dbInit'

import { isPhotosTooOld } from '../Helpers/CheckTooOld'
import { createPhotosSchema } from '../dtos/Photos'

/* ---------------- CONFIG ---------------- */

const CACHE_TTL = 3600 * 24 * 90

/* ---------------- INTERESTS (SOURCE UNIQUE) ---------------- */

const INTEREST_TO_QUERY: Record<string, string> = {
  'ai-ml': 'artificial intelligence technology',
  'computer-science': 'programming code screen',
  cybersecurity: 'cybersecurity digital lock',
  robotics: 'robot automation',
  engineering: 'engineering blueprint',
}

/* ---------------- HELPERS ---------------- */

export function getAllUnsplashQueries(): string[] {
  return Object.values(INTEREST_TO_QUERY)
}

function mapInterestsToQueries(interests: string[]) {
  return interests.map(i => INTEREST_TO_QUERY[i]).filter(Boolean)
}

/* ---------------- CACHE ---------------- */

async function getFromCache(cacheKey: string) {
  const raw = await redisClient.get(cacheKey)
  if (!raw) return null

  try {
    const parsed = JSON.parse(typeof raw === 'string' ? raw : raw.toString())
    if (!parsed?.photosArray?.length) return null

    return parsed.photosArray
  } catch {
    return null
  }
}

/* ---------------- DB ---------------- */

async function getFromDB(interest: string) {
  const photos = await Photo.findAll({ where: { interest } })
  if (!photos.length) return null

  const mapped = photos.map(p => p.toJSON())
  if (isPhotosTooOld(mapped)) return null

  return mapped
}

/* ---------------- WRITE SYNC ---------------- */

async function setInCache(
  cacheKey: string,
  interest: string,
  photos: any[]
) {
  if (!photos?.length) return

  const photosArray = photos.map(photo =>
    createPhotosSchema.parse({
      unsplashId: photo.id,
      url: photo.url,
      thumb: photo.thumb,
      description: photo.description,
      photographer: photo.photographer,
      photographerLink: photo.photographerLink,
      downloadLink: photo.downloadLink,
      interest,
      type: 'photo',
    })
  )

  const t = await sequelizeDb.transaction()

  try {
    await Photo.destroy({ where: { interest }, transaction: t })
    await Photo.bulkCreate(photosArray, { transaction: t })

    await t.commit()

    await redisClient.setEx(
      cacheKey,
      CACHE_TTL,
      JSON.stringify({ photosArray })
    )
  } catch (err) {
    await t.rollback()
    console.error('Cache write error:', err)
  }
}

/* ---------------- UNSPLASH API ---------------- */

async function fetchPhotosFromAPI(
  interest: string,
  baseUrl: string,
  clientId: string
) {
  const url =
    `${baseUrl}/search/photos?query=${encodeURIComponent(interest)}` +
    `&per_page=30&client_id=${clientId}`

  const res = await fetch(url)
  if (!res.ok) return []

  const data = await res.json()

  return data.results.map((photo: any) => ({
    id: photo.id,
    url: photo.urls.regular,
    thumb: photo.urls.thumb,
    description: photo.alt_description,
    photographer: photo.user.name,
    photographerLink: photo.user.links.html,
    downloadLink: photo.links.download,
  }))
}

/* ---------------- USER FLOW ---------------- */

async function resolveQueriesForUser(queries: string[]) {
  const results = await Promise.all(
    queries.map(async interest => {
      const cacheKey = `unsplash:${interest}`

      return (
        (await getFromCache(cacheKey)) ||
        (await getFromDB(interest)) ||
        []
      )
    })
  )

  return results.flat()
}

/* ---------------- CONTROLLER ---------------- */

async function handleUnsplash(req: any, res: any) {
  try {
    const userId = req.user?.id || req.user?.userId
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const user = await User.findByPk(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const interests = JSON.parse(user.interests || '[]')
    if (!interests.length) return res.json({ photos: [] })

    const queries = mapInterestsToQueries(interests)
    const photos = await resolveQueriesForUser(queries)

    return res.json({ photos })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

/* ---------------- CRON ---------------- */

export async function checkPhotos(queries) {
  console.log('CRON UNSPLASH START')

  const baseUrl =
    process.env.BASE_URL_UNSPLASH || 'https://api.unsplash.com'
    const clientId = process.env.API_KEY_UNSPLASH


  for (const interest of queries) {
    try {
      const cacheKey = `unsplash:${interest}`

      const cached = await getFromCache(cacheKey)
      console.log("cached => ", cached);
      if (cached?.length && !isPhotosTooOld(cached)) {
        console.log(`skip ${interest} (cache fresh)`)
        continue
      } 
      

      const dbPhotos = await getFromDB(interest)
      console.log("dbPhotos => ", dbPhotos);
      if (dbPhotos && !isPhotosTooOld(dbPhotos)) {
        console.log(`skip ${interest} (DB fresh)`)
        continue
      }

      const photos = await fetchPhotosFromAPI(
        interest,
        baseUrl,
        clientId
      )

      if (!photos.length) {
      continue

      } 
      await setInCache(cacheKey, interest, photos)

    } catch (err) {
      console.error(`cron error ${interest}`, err)
    }
  }

  console.log('CRON UNSPLASH DONE')
}

export default handleUnsplash