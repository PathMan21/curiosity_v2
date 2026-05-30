import User from '../Models/User'
import Photo from '../Models/Photo'
import redisClient from '../Config/redis.conf'
import sequelizeDb from '../Config/dbInit'

import { isPhotosTooOld } from '../Helpers/CheckTooOld'
import { createPhotosSchema } from '../dtos/Photos'

/* ---------------- CONFIG ---------------- */

const CACHE_TTL = 3600 * 24 * 90

/* ---------------- INTERESTS (SOURCE UNIQUE) ---------------- */

const INTEREST_TO_SENTENCE: Record<string, string> = {
  'ai-ml':               'artificial intelligence technology',
  'computer-vision':     'computer vision camera lens',
  'nlp':                 'natural language text processing',
  'cybersecurity':       'cybersecurity digital lock',
  'robotics':            'robot automation machine',
  'data-science':        'data visualization analytics dashboard',
  'computer-networks':   'network server cables infrastructure',
  'software-engineering':'software developer code screen',
  'databases':           'database storage server',
  'distributed-systems': 'cloud computing infrastructure',
  'quantum-computing':   'quantum physics laboratory',
}

/* ---------------- HELPERS ---------------- */

export function getAllUnsplashQueries(){
  return Object.values(INTEREST_TO_SENTENCE)
}

function mapInterestsToSentences(interests) {
  return interests.map(int => INTEREST_TO_SENTENCE[int]).filter(Boolean)
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

async function getFromDB(interest) {
  const photos = await Photo.findAll({ where: { interest } })
  if (!photos.length) {
    return null
  }
  const mapped = photos.map(p => p.toJSON())
  if (isPhotosTooOld(mapped)) {
    return null
  }
  return mapped
}

/* ---------------- WRITE SYNC ---------------- */

async function setCache(
  cacheKey,
  interest,
  photos
) {
  if (!photos?.length) {
    return

  }
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

 

  try {

    await redisClient.setEx(
      cacheKey,
      CACHE_TTL,
      JSON.stringify({ photosArray })
    )
  } catch (err) {
    console.error('[CRON] Unsplash cache write failed:', err instanceof Error ? err.message : err)
  }
}
async function setDbAndCache(
  cacheKey,
  interest,
  photos
) {
  console.log("set db and cache")
  if (!photos?.length) {
    return

  }
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
    await Photo.destroy({ where: {interest: interest }, transaction: t })
    await Photo.bulkCreate(photosArray, { transaction: t })

    await t.commit()

    await redisClient.setEx(
      cacheKey,
      CACHE_TTL,
      JSON.stringify({ photosArray })
    )
  } catch (err) {
    await t.rollback()
    console.error('[CRON] Unsplash cache write failed:', err )
  }
}

/* ---------------- UNSPLASH API ---------------- */

async function fetchPhotosFromAPI(
  interest, clientId
) {
  const baseUrl = 'https://api.unsplash.com'

  const url =
    `${baseUrl}/search/photos?query=${encodeURIComponent(interest)}` +
    `&per_page=30&client_id=${clientId}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) {
      return []

    }
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
  } catch (error) {
    console.error('error => ', error)
    return []
  }
}

/* ---------------- USER FLOW ---------------- */

async function fetchGlobal(sent) {
  const results = await Promise.all(
    sent.map(async interest => {
      const cacheKey = `unsplash-${interest}`

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

async function handleUnsplash(req, res) {
  try {
    const userId = req.user?.id;
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' })

    }
    const interests = JSON.parse(user.interests)
    if (!interests.length) {
      console.error("Intérets non trouvé");
      return null;

    }
    const sent = mapInterestsToSentences(interests)
    const photos = await fetchGlobal(sent)

    return res.json({ photos })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: `Problèmes serveur => ${err}` })
  }
}

/* ---------------- CRON ---------------- */

export async function checkPhotos(queries) {
  const clientId = process.env.API_KEY_UNSPLASH

  const resultsInfo = { synced: 0, cached: 0, db: 0, errors: 0 }

  for (const interest of queries) {
    try {
      const cacheKey = `unsplash-${interest}`

      const cached = await getFromCache(cacheKey)
      if (cached?.length && !isPhotosTooOld(cached)) {
        resultsInfo.cached++
        continue
      }

      const dbPhotos = await getFromDB(interest)
      if (dbPhotos && !isPhotosTooOld(dbPhotos)) {
        setCache(cacheKey, interest, dbPhotos)
        resultsInfo.db++
        continue
      }

      const photos = await fetchPhotosFromAPI(interest, clientId)

      if (!photos.length) {
        continue
      }
      await setDbAndCache(cacheKey, interest, photos)
      resultsInfo.synced++

    } catch (err) {
      resultsInfo.errors++
      console.error(`CRON UNSPLASH erreur => "${interest}" : `, err)
    }
  }

  console.log(`CRON UNSPLASH : caché ${resultsInfo.cached}, db ${resultsInfo.db}, réussis ${resultsInfo.synced}, errors ${resultsInfo.errors}`)
}

export default handleUnsplash