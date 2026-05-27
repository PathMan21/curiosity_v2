import cron from 'node-cron'
import { checkPhotos, getAllUnsplashQueries } from "../Services/api-externes.services.handleUnsplash"

let isCronRunning = false

const task = async () => {
  if (isCronRunning) {
    console.warn('CRON PHOTO => TOUJOURS EN EXECUTION')
    return
  }

  isCronRunning = true
  const startTime = Date.now()

  try {
    console.log('CRON PHOTO => COMMENCEMENT')
    const queries = await getAllUnsplashQueries()
    await checkPhotos(queries)
    const duration = Date.now() - startTime
    console.log(`CRON PHOTO FINIS => Photo sync en ${duration}ms`)
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`CRON PHOTO ERREUR : échoué en '${duration}ms' parce que => '${error}'`)
  } finally {
    isCronRunning = false
  }
}

cron.schedule('* * * * *', task)