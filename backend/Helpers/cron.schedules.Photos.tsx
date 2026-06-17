import cron from 'node-cron'
import {
  checkPhotos,
  getAllUnsplashQueries,
} from '../Services/api-externes.services.handleUnsplash'

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

    const queries = getAllUnsplashQueries()

    console.log('Nombre de requêtes :', queries.length)

    await checkPhotos(queries)

    const duration = Date.now() - startTime

    console.log(
      `CRON PHOTO FINI => synchronisation terminée en ${duration}ms`
    )
  } catch (error) {
    const duration = Date.now() - startTime

    console.error(
      `CRON PHOTO ERREUR => échec après ${duration}ms`,
      error
    )
  } finally {
    isCronRunning = false
  }
}

const scheduledTask = cron.schedule('* * * * *', task, {
  scheduled: true,
})

export default scheduledTask