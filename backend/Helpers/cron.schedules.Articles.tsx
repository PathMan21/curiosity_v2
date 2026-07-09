import {
  checkArticles,
  getAllOpenAlexQueries,
} from '../Services/api-externes.services.handleOpenAlex'
import cron from 'node-cron'

let isCronRunning = false

const task = async () => {
  if (isCronRunning) return

  isCronRunning = true
  const startTime = Date.now()

  try {
    console.log('CRON START')

    const queries = await getAllOpenAlexQueries()

    for (const query of queries) {
      console.log("valeur de l'intéret open alex cron => ", query)
      await checkArticles(query)
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    console.log(`CRON DONE => ${Date.now() - startTime}ms`)
  } catch (error) {
    console.error('CRON ERROR =>', error)
  } finally {
    isCronRunning = false
  }
}

const scheduledTask = cron.schedule('0 2 * * *', task)

export default scheduledTask
