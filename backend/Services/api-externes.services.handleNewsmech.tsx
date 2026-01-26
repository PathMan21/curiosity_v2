import dotenv from "dotenv";
import interestsData from '../Assets/interests.json';
import { User } from "backend/Models";

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
        console.log("Intérêts utilisateur:", userInterests);
        
        let newsmechCategories = mapInterestsToNewsMech(userInterests);
        console.log("Catégories NewsMech:", newsmechCategories);
        
        if (newsmechCategories.length === 0) {
            return res.status(400).json({
                status: "Failed",
                message: "Aucune catégorie NewsMech trouvée"
            });
        }
        
        let shuffledCategories = shuffleArray(newsmechCategories);
        
        let allArticles = [];
        
        for (const category of shuffledCategories) {
            let urlNews = `${baseurl}trending?apiKey=${apiKey}&limit=5&category=${category}`;
            console.log(`Requête NewsMech [${category}] : `, urlNews);
            
            const response = await fetch(urlNews, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                const articlesWithCategory = (data.articles || []).map(article => ({
                    ...article,
                    newsmech_category: category
                }));
                
                allArticles = [...allArticles, ...articlesWithCategory];
                console.log(`${articlesWithCategory.length} articles pour ${category}`);
            } else {
                console.error(`Catégorie ${category}:`, response.status);
            }
        }
        
        console.log(`Total articles récupérés: ${allArticles.length}`);
        
        const shuffledArticles = shuffleArray(allArticles);
        
        const finalArticles = shuffledArticles.slice(0, 20);
        
        const formattedArticles = finalArticles.map(article => ({
            title: article.title,
            description: article.description || article.excerpt,
            url: article.url,
            imageUrl: article.image || article.urlToImage,
            publishedAt: article.publishedAt || article.published_at,
            source: article.source?.name || article.source,
            category: article.newsmech_category,
            author: article.author
        }));
        
        return res.json({
            status: "Success",
            totalArticles: allArticles.length,
            returnedArticles: formattedArticles.length,
            categories: shuffledCategories,
            articles: formattedArticles
        });
        
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
    const categories = null;
    
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
        
        categories.add(interest.newsmech_category);
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