// cron/openalex.cron.ts

import { getAllSubfields } from '../Services/api-externes.services.handleOpenAlex'
import { cronOpenAlex } from '../Services/api-externes.services.handleOpenAlex'

import cron from 'node-cron'

// const task = async () => {
//   console.log("open alex cron - ", Date.now())
//   const subfields = getAllSubfields()
//   await cronOpenAlex(subfields)

//   console.log("fin open alex cron - ", Date.now())
// }


// cron.schedule('*/5 * * * *', task)