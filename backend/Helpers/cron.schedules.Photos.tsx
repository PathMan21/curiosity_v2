import cron from 'node-cron'
import {
  checkPhotos,
  getAllUnsplashQueries,
} from '../Services/api-externes.services.handleUnsplash'

let isCronRunning = false

const task = async () => {
  if (isCronRunning) {
    return
  }

  isCronRunning = true
  const startTime = Date.now()

  try {
    const queries = await getAllUnsplashQueries()

    for (const query of queries) {
      await checkPhotos(query)

      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    const duration = Date.now() - startTime
  } catch (error) {
    const duration = Date.now() - startTime
  } finally {
    isCronRunning = false
  }
}

const scheduledTask = cron.schedule('*/5 * * * *', task)

export default scheduledTask
