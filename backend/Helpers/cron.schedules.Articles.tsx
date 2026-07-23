import { checkArticles, getAllOpenAlexQueries } from "../Services/api-externes.services.handleOpenAlex"
import cron from 'node-cron'

let isCronRunning = false

  const task = async () => {
  
  
  if (isCronRunning) return

  isCronRunning = true
  const startTime = Date.now()

  try {


    const queries = await getAllOpenAlexQueries()

    for (const query of queries) {

      await checkArticles(query)
      await new Promise(resolve =>
        setTimeout(resolve, 200)
      )
    }

    console.log(
      `CRON DONE => ${Date.now() - startTime}ms`
    )
  } catch (error) {

  } finally {
    isCronRunning = false
  }
}


const scheduledTask = cron.schedule('0 7 * * *', task)

export default scheduledTask