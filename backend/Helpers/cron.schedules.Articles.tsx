import { checkArticles, getAllOpenAlexQueries } from "../Services/api-externes.services.handleOpenAlex"
import cron from 'node-cron'

let isCronRunning = false

const task = async () => {
  if (isCronRunning) {
    console.warn('CRON => TOUJOURS EN EXECUTION')
    return
  }

  isCronRunning = true
  const startTime = Date.now()

  try {
    console.log('CRON ARTICLES => COMMENCEMENT')
    const queries = getAllOpenAlexQueries()
    await checkArticles(queries)
    console.log(`CRON FINIS => Articles sync en ${Date.now() - startTime}ms`)
  } catch (error) {
    console.error(`CRON ERREUR : échoué en '${Date.now() - startTime}ms' parce que => '${error}'`)
  } finally {
    isCronRunning = false
  }
}

cron.schedule('*/3 * * * *', task)