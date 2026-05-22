import cron from 'node-cron'
import { checkPhotos, getAllUnsplashQueries } from "../Services/api-externes.services.handleUnsplash"

const task = async () => {
  const start = Date.now()
  console.log('Cron start:', new Date().toISOString())
  try {
    const queries = await getAllUnsplashQueries()
    console.log('Queries done in', Date.now() - start, 'ms')
    await checkPhotos(queries)
    console.log('checkPhotos done in', Date.now() - start, 'ms')
  } catch (error) {
    console.error('Cron Photo Error:', error)
  }
}
cron.schedule('* * * * *', task)
console.log('Unsplash cron started')