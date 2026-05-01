import cron from "node-cron";
import { checkArticles, getAllSubjects } from "../Services/api-externes.services.handleOpenAlex";
import { checkBooks, getAllLibraryCategories } from "../Services/api-externes.services.handleOpenLibrary";
import { checkNews, getAllNewsmechCategories } from "../Services/api-externes.services.handleNewsmech";
import { checkPhotos, getAllUnsplashQueries } from "../Services/api-externes.services.handleUnsplash";


const cronTime = "0 2 * * *";
const task = async () => {
        console.log("cron exécuté à :", new Date().toString());
        
        //OpenAlex
            const subjects = await getAllSubjects();
            console.log("cron OpenAlex - Sujets:", subjects?.length);
            isArticlesTooOld(subjects);


        // OpenLibrary
            const categories = await getAllLibraryCategories();
            console.log("OpenLibrary - Catégories :", categories?.length);
            checkBooks(categories).catch(err => 
                console.error("cron openLibrary erreur async : ", err.message)
            );

        //Newsmech 
            const newsCategories = await getAllNewsmechCategories();
            console.log("Newsmech - Catégories : ", newsCategories?.length);
            checkNews(newsCategories).catch(err => 
                console.error("Newsmech erreur async : ", err.message)
            );
       

        //Unsplash
            const queries = await getAllUnsplashQueries();
            console.log("cron Unsplash : ", queries?.length);
            checkPhotos(queries).catch(err => 
                console.error("cron Unsplash erreur async : ", err.message)
            );

        console.log("cron => Toutes est lancées en arrière-plan");
    }






cron.schedule(cronTime, task);

// Run once at startup for testing
task().catch(err => console.error('Erreur cron initial:', err));

