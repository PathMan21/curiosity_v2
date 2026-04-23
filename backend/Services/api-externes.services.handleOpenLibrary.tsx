import { User } from '../Models'
import Book from '../Models/Book'
import interestsData from '../Assets/interests.json'
import redisClient from '../Config/redis.conf'
import { isBooksTooOld } from '../Helpers/CheckTooOld'
const BASE_URL = 'https://openlibrary.org'
const COVERS_URL = 'https://covers.openlibrary.org/b/id'
const CACHE_TTL = 3600 * 24 * 90
const MAX_BOOK_AGE_DAYS = 90
const SEARCH_LIMIT = 5

const CATEGORIES_SUBJECT = {
  artificial_intelligence: ['machine learning', 'deep learning', 'neural networks', 'computer vision', 'natural language processing'],
  computer:                ['algorithms', 'data structures', 'software engineering', 'programming', 'operating systems'],
  cybersecurity:           ['network security', 'cryptography', 'ethical hacking', 'data protection', 'malware analysis'],
  robotics:                ['automation', 'control systems', 'embedded systems', 'computer vision', 'robot kinematics'],
  mathematics:             ['algebra', 'geometry', 'calculus', 'statistics', 'probability', 'number theory'],
  physics:                 ['mechanics', 'thermodynamics', 'quantum physics', 'optics', 'electromagnetism'],
  chemistry:               ['organic chemistry', 'inorganic chemistry', 'biochemistry', 'analytical chemistry', 'physical chemistry'],
  biology:                 ['genetics', 'microbiology', 'cell biology', 'evolution', 'zoology'],
  medicine:                ['clinical research', 'pathology', 'pharmacology', 'surgery', 'public health'],
  neurosciences:           ['cognitive neuroscience', 'neurobiology', 'brain imaging', 'neuropsychology', 'neural networks'],
  ecology:                 ['ecosystems', 'biodiversity', 'conservation', 'environmental science', 'wildlife management'],
  climatology:             ['climate change', 'meteorology', 'atmospheric science', 'global warming', 'climate modeling'],
  energy:                  ['renewable energy', 'solar power', 'wind energy', 'energy storage', 'nuclear energy'],
  economics:               ['microeconomics', 'macroeconomics', 'econometrics', 'development economics', 'behavioral economics'],
  finance:                 ['investment', 'corporate finance', 'financial markets', 'risk management', 'accounting'],
  psychology:              ['cognitive psychology', 'behavioral psychology', 'clinical psychology', 'developmental psychology', 'social psychology'],
  sociology:               ['social theory', 'inequality', 'culture', 'demography', 'urban studies'],
  engineering:             ['mechanical engineering', 'electrical engineering', 'civil engineering', 'software engineering', 'systems engineering'],
  astronomy:               ['astrophysics', 'cosmology', 'planetary science', 'space exploration', 'stellar evolution'],
  art:                     ['painting', 'sculpture', 'photography', 'digital art', 'art history'],
  sports:                  ['fitness', 'training', 'sports science', 'nutrition', 'athletics'],
  business:                ['management', 'marketing', 'entrepreneurship', 'strategy', 'operations'],
}

function mapInterestsToOpenLibrary(interestIds: string[]) {
  const categories = []

  interestIds.forEach((interestId) => {
    const interest = interestsData.interests.find((i) => i.id === interestId)
    if (!interest?.open_library) return

    const subjects = CATEGORIES_SUBJECT[interest.open_library]
    if (!subjects?.length) return

    const random = subjects[Math.floor(Math.random() * subjects.length)]
    categories.push({ category: interest.open_library, subject: random })
  })

  return categories
}



async function getFromCache(cacheKey: string) {
  try {
    const raw = await redisClient.get(cacheKey)
    
    const rawString = raw.toString();
    if (!rawString.trim()) return null

    const parsed = JSON.parse(rawString);

    console.log(parsed);
    if (!parsed?.books?.length) return null

    if (isBooksTooOld(parsed.books)) {
      console.log(`Livres trop vieux dans cache pour "${cacheKey}"`)
      return null
    }

    return parsed.books
  } catch (err) {
    console.warn(`Erreur Redis lecture (${cacheKey}):`, err.message)
    return null
  }
}

export async function getFromDB(cacheKey: string) {
  try {
    const books = await Book.findAll({ where: { cacheKey } })
    if (books.length === 0) return null

    const mapped = books.map((b) => b.toJSON())

    if (isBooksTooOld(mapped)) {
      console.log(`🗑️ Livres trop vieux pour "${cacheKey}", réhydratation...`)
      return null
    }

    return mapped
  } catch (err) {
    console.warn(`⚠️ Erreur BDD OpenLibrary (${cacheKey}):`, err.message)
    return null
  }
}

async function setInCache(cacheKey: string, books: any[]) {
  if (!books.length) return

  await Book.destroy({ where: { cacheKey } })

  await Promise.all(
    books.map(async (book) => {
      await Book.create({
        title: book.title,
        author: book.author,
        description: book.description,
        subject: book.subject,
        url: book.url,
        cover: book.cover,
        cacheKey,
        type: 'book',
      })
    })
  )

  try {
    await redisClient.setEx(
      cacheKey,
      CACHE_TTL,
      JSON.stringify({ totalResults: books.length, books })
    )
    console.log(`💾 Cache OK — ${cacheKey} (${books.length} livres)`)
  } catch (err) {
    console.warn(`⚠️ Erreur Redis écriture (${cacheKey}):`, err.message)
  }
}

function parseDescription(raw) {
  if (!raw) return null
  if (typeof raw === 'string') return raw
  if (typeof raw === 'object' && raw.value) return raw.value
  return null
}

async function fetchBookDetail(book, subject: string) {
  try {
    const workRes = await fetch(`${BASE_URL}${book.key}.json`)
    if (!workRes.ok) return null

    const result = await workRes.json()

    const coverUrl = book.cover_i
      ? `${COVERS_URL}/${book.cover_i}-L.jpg`
      : result.covers?.length > 0
        ? `${COVERS_URL}/${result.covers[0]}-L.jpg`
        : null

    return {
      title: result.title,
      author: book.author_name?.join(', ') || 'Unknown',
      description: parseDescription(result.description),
      subject,
      url: `https://openlibrary.org${book.key}`,
      cover: coverUrl,
      type: 'book',
    }
  } catch (err) {
    console.error('❌ Erreur fetch livre:', err.message)
    return null
  }
}

async function fetchBooksFromAPI(category: string, subject: string) {
  const url = `${BASE_URL}/search.json?q=${encodeURIComponent(subject)}&has_fulltext=true&language=eng&limit=${SEARCH_LIMIT}`

  console.log(`🌐 Fetch OpenLibrary — category: "${category}" subject: "${subject}"`)

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`OpenLibrary search failed: ${response.status}`)
  }

  const { docs } = await response.json()
  const books = await Promise.all(docs.map((book) => fetchBookDetail(book, subject)))
  return books.filter(Boolean)
}

async function resolveCategories(categories: { category: string; subject: string }[]) {
  const allBooks = []

  await Promise.all(
    categories.map(async ({ category, subject }) => {
      const cacheKey = `handle-open-library-${category}`

      // 1. Cache Redis
      const cached = await getFromCache(cacheKey)
      if (cached) {
        console.log(`✅ Cache hit — ${cacheKey}`)
        allBooks.push(...cached)
        return
      }

      // 2. BDD
      const fromDB = await getFromDB(cacheKey)
      if (fromDB) {
        console.log(`✅ BDD hit — ${cacheKey}`)
        allBooks.push(...fromDB)
        await redisClient.setEx(
          cacheKey,
          CACHE_TTL,
          JSON.stringify({ totalResults: fromDB.length, books: fromDB })
        )
        return
      }

      // 3. API
      const books = await fetchBooksFromAPI(category, subject)
      allBooks.push(...books)
      await setInCache(cacheKey, books)
    })
  )

  return allBooks
}

async function handleOpenLibrary(req, res) {
  try {
    const user = await User.findOne({ where: { id: req.user.userId } })
    if (!user) {
      return res.status(404).json({ status: 'Failed', message: 'Utilisateur non trouvé' })
    }

    const userInterests = JSON.parse(user.interests || '[]')
    const categories = mapInterestsToOpenLibrary(userInterests)

    if (!categories.length) {
      return res.status(400).json({ status: 'Failed', message: 'Aucun intérêt valide trouvé' })
    }

    const books = await resolveCategories(categories)

    return res.json({ status: 'Success', totalResults: books.length, data: books })
  } catch (err) {
    console.error('❌ Erreur handleOpenLibrary:', err)
    return res.status(500).json({ status: 'Failed', message: 'Erreur serveur' })
  }
}

// CRON: Récupérer tous les sujets et mettre à jour les livres
export async function getAllLibraryCategories() {
  const allInterestIds = []
  const interestsData_local = require('../Assets/interests.json')
  interestsData_local.interests.forEach(interest => {
    if (interest.id) allInterestIds.push(interest.id)
  })
  return mapInterestsToOpenLibrary(allInterestIds)
}

export async function checkBooks(categories) {
  try {
    console.log('📚 [CRON] Mise à jour OpenLibrary - Catégories:', categories?.length || 0)
    const books = await resolveCategories(categories)
    console.log('✅ [CRON] Livres mis à jour:', books.length)
    return books
  } catch (error) {
    console.error('❌ [CRON] Erreur OpenLibrary:', error.message)
    throw error
  }
}

export default handleOpenLibrary