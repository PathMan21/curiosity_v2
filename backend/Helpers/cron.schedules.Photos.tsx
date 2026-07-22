import cron from 'node-cron'
import {
  checkPhotos,
  getAllUnsplashQueries,
} from '../Services/api-externes.services.handleUnsplash'

let isCronRunning = false

export const task = async () => {
  if (isCronRunning) {
    console.warn('CRON PHOTO => TOUJOURS EN EXECUTION')
    return
  }

  isCronRunning = true
  const startTime = Date.now()

  try {
    console.log('CRON PHOTO ')

    const queries = getAllUnsplashQueries()

    await checkPhotos(queries)

    const duration = Date.now() - startTime

    console.log(`CRON PHOTO FINI`)
  } catch (error) {
    const duration = Date.now() - startTime

    console.error(`CRON PHOTO ERREUR : `, error)
  } finally {
    isCronRunning = false
  }
}

const scheduledTask = cron.schedule('0 2 * * *', task)

export default scheduledTask
