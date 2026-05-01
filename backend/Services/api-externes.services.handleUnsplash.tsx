import User from '../Models/User'
import Photo from '../Models/Photo'
import redisClient from '../Config/redis.conf'
import { Op } from 'sequelize'

import { isPhotosTooOld } from '../Helpers/CheckTooOld'

import "../Helpers/configLink";
const CACHE_TTL = 3600 * 24 * 90
const MAX_PHOTO_AGE_DAYS = 90

const INTEREST_TO_QUERY = {
  'ai-ml':            'artificial intelligence technology',
  'computer-science': 'programming code screen',
  cybersecurity:      'cybersecurity digital lock',
  robotics:           'robot automation',
  engineering:        'engineering blueprint',
  mathematics:        'mathematics equations',
  physics:            'physics laboratory',
  chemistry:          'chemistry lab beaker',
  biology:            'biology microscope cells',
  medicine:           'medical research hospital',
  neuroscience:       'brain scan neuroscience',
  ecology:            'nature forest biodiversity',
  climate:            'climate earth atmosphere',
  energy:             'solar panels renewable energy',
  economics:          'economics graph chart',
  finance:            'stock market trading',
  psychology:         'psychology therapy mind',
  sociology:          'people community society',
  business:           'business meeting office',
  space:              'space galaxy stars',
  art:                'art museum painting',
  sport:              'sports athlete training',
}

function mapInterestsToQueries(interests: string[]) {
  return interests.map((i) => INTEREST_TO_QUERY[i]).filter(Boolean)
}



async function getFromCache(cacheKey: string) {
  try {
    const raw = await redisClient.get(cacheKey)
    if (!raw) return null

    const rawString = raw.toString();
    if (!rawString.trim()) return null

    const parsed = JSON.parse(rawString);

    
    if (!parsed?.photos?.length) return null

    if (isPhotosTooOld(parsed.photos)) {
      console.log(`Photos trop vieilles dans cache pour "${cacheKey}"`)
      return null
    }

    return parsed.photos
  } catch (err) {
    console.warn(`Erreur Redis lecture (${cacheKey}):`, err.message)
    return null
  }
}

export async function getFromDB(interest: string) {
  try {
    const photos = await Photo.findAll({ where: { interest } })
    if (photos.length === 0) return null

    const mapped = photos.map((p) => p.toJSON())

    if (isPhotosTooOld(mapped)) {
      console.log(`🗑️ Photos trop vieilles pour "${interest}", réhydratation...`)
      return null
    }

    return mapped
  } catch (err) {
    console.warn(` Erreur BDD Unsplash (${interest}):`, err.message)
    return null
  }
}

async function setInCache(cacheKey: string, interest: string, photos: any[]) {
  await Photo.destroy({ where: { interest } })

  await Promise.all(
    photos.map(async (photo) => {
      await Photo.create({
        unsplashId: photo.id,
        url: photo.url,
        thumb: photo.thumb,
        description: photo.description,
        photographer: photo.photographer,
        photographerLink: photo.photographerLink,
        downloadLink: photo.downloadLink,
        interest,
        type: "photo"
      })
    })
  )

  try {
    await redisClient.setEx(
      cacheKey,
      CACHE_TTL,
      JSON.stringify({ interest, totalResults: photos.length, photos })
    )
    console.log(`Cache OK — ${cacheKey} (${photos.length} photos)`)
  } catch (err) {
    console.warn(`Erreur Redis écriture (${cacheKey}):`, err.message)
  }
}

async function fetchPhotosFromAPI(interest: string, baseUrl: string, clientId: string) {
  const url = `${baseUrl}/search/photos?query=${encodeURIComponent(interest)}&count=100&client_id=${clientId}`

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    console.warn(`Unsplash non OK (${interest}): ${response.status}`)
    return []
  }

  const data = await response.json()

  return data.results.map((photo) => ({
    id: photo.id,
    url: photo.urls.regular,
    thumb: photo.urls.thumb,
    description: photo.alt_description,
    photographer: photo.user.name,
    photographerLink: photo.user.links.html,
    downloadLink: photo.links.download,
    type: 'photo',
  }))
}

async function resolveQueries(queries: string[], baseUrl: string, clientId: string) {
  const allPhotos = []
  const toFetch = []

  await Promise.all(
    queries.map(async (interest) => {
      const cacheKey = `handle-unsplash-${interest}`

      // 1. Cache Redis
      const cached = await getFromCache(cacheKey)
      if (cached) {
        console.log(`Cache hit — ${cacheKey}`)
        allPhotos.push(...cached)
        return
      }

      // 2. BDD
      const fromDB = await getFromDB(interest)
      if (fromDB) {
        console.log(`BDD hit — ${interest}`)
        allPhotos.push(...fromDB)
        await redisClient.setEx(
          cacheKey,
          CACHE_TTL,
          JSON.stringify({ interest, totalResults: fromDB.length, photos: fromDB })
        )
        return
      }

      // 3. API
      console.log(`Fetch API — Unsplash "${interest}"`)
      toFetch.push(interest)
    })
  )

  if (toFetch.length > 0) {
    await Promise.all(
      toFetch.map(async (interest) => {
        const cacheKey = `handle-unsplash-${interest}`
        const photos = await fetchPhotosFromAPI(interest, baseUrl, clientId)

        allPhotos.push(...photos)
        await setInCache(cacheKey, interest, photos)
      })
    )
  }

  return allPhotos
}

async function handleUnsplash(req, res) {
  try {
    const baseUrl = process.env.BASE_URL_UNSPLASH || 'https://api.unsplash.com'
    const clientId = process.env.API_KEY_UNSPLASH
    const userId = req.user?.id || req.user?.userId

    if (!userId) {
      return res.status(401).json({ status: 'Failed', message: 'Utilisateur non authentifié' })
    }

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ status: 'Failed', message: 'Utilisateur inconnu' })
    }

    let interests = []
    try {
      interests = JSON.parse(user.interests || '[]')
    } catch (e) {
      console.warn('Impossible de parser les intérêts :', e)
    }

    if (!interests.length) {
      return res.json({ status: 'Success', photos: [] })
    }

    const queries = mapInterestsToQueries(interests)
    const photos = await resolveQueries(queries, baseUrl, clientId)

    return res.json({ status: 'Success', photos })
  } catch (err) {
    console.error('Erreur handleUnsplash:', err)
    return res.status(500).json({ status: 'Failed', message: 'Erreur serveur' })
  }
}

// CRON
export async function getAllUnsplashQueries() {
  const allInterestIds = []
  const interestsData_local = require('../Assets/interests.json')
  interestsData_local.interests.forEach(interest => {
    if (interest.id) allInterestIds.push(interest.id)
  })
  return mapInterestsToQueries(allInterestIds)
}

export async function checkPhotos(queries) {
  try {
    console.log('mise à jour via cron => unsplash ', queries?.length)
    const baseUrl = process.env.BASE_URL_UNSPLASH || 'https://api.unsplash.com'
    const clientId = process.env.API_KEY_UNSPLASH
    const photos = await resolveQueries(queries, baseUrl, clientId)
    console.log('Photos => ', photos.length)
    return photos
  } catch (error) {
    console.error('Erreur Unsplash :', error.message)
    throw error
  }
}

export default handleUnsplash