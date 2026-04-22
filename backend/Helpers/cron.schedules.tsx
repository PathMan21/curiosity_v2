import cron from "node-cron";
import { checkArticles, getAllSubjects } from "../Services/api-externes.services.handleOpenAlex";
import { checkBooks, getAllLibraryCategories } from "../Services/api-externes.services.handleOpenLibrary";
import { checkNews, getAllNewsmechCategories } from "../Services/api-externes.services.handleNewsmech";
import { checkPhotos, getAllUnsplashQueries } from "../Services/api-externes.services.handleUnsplash";


const cronTime = "* 02 * * *";
const task = async () => {
    try {
        console.log("cron exécuté à :", new Date().toString());
        
        //OpenAlex
        try {
            const subjects = await getAllSubjects();
            console.log("✅ [CRON] OpenAlex - Sujets:", subjects?.length);
            checkArticles(subjects).catch(err => 
                console.error("error cron ", err.message)
            );
        } catch (error) {
            console.error("error cron ", error.message);
        }

        // OpenLibrary
        try {
            const categories = await getAllLibraryCategories();
            console.log("OpenLibrary - Catégories :", categories?.length);
            checkBooks(categories).catch(err => 
                console.error("cron openLibrary erreur async : ", err.message)
            );
        } catch (error) {
            console.error("cron openLibrary erreur : ", error.message);
        }

        //Newsmech 
        try {
            const newsCategories = await getAllNewsmechCategories();
            console.log("Newsmech - Catégories : ", newsCategories?.length);
            checkNews(newsCategories).catch(err => 
                console.error("Newsmech erreur async : ", err.message)
            );
        } catch (error) {
            console.error("Newsmech erreur : ", error.message);
        }

        //Unsplash
        try {
            const queries = await getAllUnsplashQueries();
            console.log("cron Unsplash : ", queries?.length);
            checkPhotos(queries).catch(err => 
                console.error("cron Unsplash erreur async : ", err.message)
            );
        } catch (error) {
            console.error("cron Unsplash erreur : ", error.message);
        }

        console.log("cron => Toutes est lancées en arrière-plan");
    } catch (error) {
        console.error("cron Erreur globale : ", error);
    }
};






cron.schedule(cronTime, task);

