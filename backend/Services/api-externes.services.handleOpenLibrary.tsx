import { User } from '../Models'
import interestsData from '../Assets/interests.json'
import redisClient from '../Config/redis.conf'

const BASE_URL = 'https://openlibrary.org'
const COVERS_URL = 'https://covers.openlibrary.org/b/id'
const CACHE_TTL = 3600 * 24 * 10 
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


function mapInterestsToOpenLibrary(interestIds) {
  const categories = []

  interestIds.forEach((interestId) => {
    const interest = interestsData.interests.find((i) => i.id === interestId)
    if (!interest?.open_library) return

    const subjects = CATEGORIES_SUBJECT[interest.open_library]
    if (!subjects?.length) return

    const random = subjects[Math.floor(Math.random() * subjects.length)]
    categories.push([interest.open_library, random])
  })

  return categories
}


async function getFromCache(cacheKey) {
  try {
    const raw = await redisClient.get(cacheKey)
    if (!raw?.trim()) return null

    const parsed = JSON.parse(raw)
    return parsed?.books?.length > 0 ? parsed.books : null
  } catch (err) {
    console.warn(`⚠️ Erreur Redis lecture (${cacheKey}):`, err.message)
    return null
  }
}

async function setInCache(cacheKey, books) {
  if (!books.length) return  

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

async function fetchBookDetail(book, subjects) {
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
      subject: subjects,
      cover: coverUrl,
    }
  } catch (err) {
    console.error('❌ Erreur fetch livre:', err.message)
    return null
  }
}


async function fetchBooksFromAPI(categories) {
  const subjects = categories.flat()
  const searchTerms = subjects.join(' ')
  const url = `${BASE_URL}/search.json?q=${encodeURIComponent(searchTerms)}&has_fulltext=true&language=eng&limit=${SEARCH_LIMIT}`

  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`OpenLibrary search failed: ${response.status}`)
  }

  const { docs } = await response.json()
  const books = await Promise.all(docs.map((book) => fetchBookDetail(book, subjects)))
  return books.filter(Boolean)
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

    const cacheKey = `handle-open-library-${categories.flat().sort().join('-')}`

    const cached = await getFromCache(cacheKey)
    if (cached) {
      console.log(`✅ Cache hit — ${cacheKey}`)
      return res.json({ status: 'Success', data: cached })
    }

    console.log(`🌐 Fetch API — OpenLibrary`)
    const books = await fetchBooksFromAPI(categories)
    await setInCache(cacheKey, books)

    return res.json({ status: 'Success', data: books })
  } catch (err) {
    console.error('❌ Erreur handleOpenLibrary:', err)
    return res.status(500).json({ status: 'Failed', message: 'Erreur serveur' })
  }
}

export default handleOpenLibrary