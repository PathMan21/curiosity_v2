import dotenv from "dotenv";
import interestsData from '../Assets/interests.json';
import { User } from "backend/Models";
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleNewsmech(req, res) {
    try {
        const baseurl = process.env.BASE_URL_NEWSMECH;
        const apiKey = process.env.API_KEY_NEWSMECH;
        const userJWT = req.user.userId;
        
        const user = await User.findOne({ where: { id: userJWT } });
        
        if (!user) {
            return res.status(404).json({
                status: "Failed",
                message: "Utilisateur non trouvé"
            });
        }
        
        let userInterests = JSON.parse(user.interests);
        console.log("Intérêts utilisateur : ", userInterests);
        
        let newsmechCategories = mapInterestsToNewsMech(userInterests);
        console.log("Catégories newmech : ", newsmechCategories);
        
        if (newsmechCategories.length === 0) {
            return res.status(404).json({
                status: "Failed",
                message: "Aucune catégorie newmech trouvée"
            });
        }
        
        let shuffledCategories = shuffleArray(newsmechCategories);
        
        let allArticles = [];
        let filteredData;
        for (const category of shuffledCategories) {
            await sleep(1000);
            let urlNews = `${baseurl}latest?apiKey=${apiKey}&limit=10&category=${category}`;
            console.log(`Requête nwsmech ${category} : `, urlNews);
            
            const response = await fetch(urlNews, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(data.data);
                let filteredData = data.data.map(article => ({
                    title: article.title,
                    description: article.description || article.excerpt,
                    publishedAt: article.published_date || article.published_date,
                    source: article.source?.name || article.source,
                    category: article.category,
                    author: article.author,
                    type: "article",
                    url: article.link,
                }));

                console.log("filteredData : ", filteredData);

            } else {
                console.error(`Catégorie ${category} error status => '${response.status}' et error msg => '${response.body}'`);
            }
        }
        
        return res.json({
            status: "Success",
            categories: shuffledCategories,
            articles: filteredData,
        })
        
    } catch (error) {
        console.error("Erreur NewsMech : ", error);
        return res.status(500).json({
            status: "Failed",
            message: "Erreur lors de la récupération des actualités",
            error: error.message
        });
    }
}

function mapInterestsToNewsMech(interestIds) {
    const categories = [];
    
    interestIds.forEach(interestId => {
        const interest = interestsData.interests.find(i => i.id === interestId);
        
        if (!interest) {
            console.warn(`interests "${interestId}" non trouvé`);
            return;
        }
        
        if (!interest.newsmech_category) {
            console.warn(`Pas de newsmech_category pour " ${interestId} "`);
            return;
        }
        console.log(categories);
        categories.push(interest.newsmech_category);
    });
    
    return Array.from(categories);
}

function shuffleArray(categories) {
    const shuffled = [...categories];

    for (let i = shuffled.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];

    }
    return shuffled;
}

export default handleNewsmech;