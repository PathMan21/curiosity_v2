import cron from "node-cron";
import { checkArticles } from "../Services/api-externes.services.handleOpenAlex";



const cronTime = "00 02 * * *";
const task = () => {
    console.log("cron qui s'active tt les jours à 2 h du mat => ", new Date());
    await checkArticles();
}






cron.schedule(cronTime, task);

