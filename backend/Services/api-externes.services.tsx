// commencer par arXiv

import { configDotenv } from "dotenv";
import { parseStringPromise } from "xml2js";
import User from "../Models/User";

let randomizeStart: string;

async function handleArxiv(req, res) {
    try {
        console.log("arxiv - récupération des données");
        const userJWT = req.user.userId;
        const user = await User.findOne({ where: { id: userJWT} })
        let randomizeStart = JSON.stringify(Math.floor(Math.random() * 100));
        let maxResult = JSON.parse(randomizeStart) + 20;


        let interests = JSON.parse(user.interests);
        let interestsShuffles = shuffleInterests(interests);

        let interestArray = interestsShuffles.join(" OR ");
        console.log(interestArray);

        
        let params = new URLSearchParams({
            search_query: interestArray,
            start: randomizeStart,
            sortBy: "relevance",
            sortOrder: "descending",
            max_results: maxResult
        });
        
        let url_complete = process.env.BASE_URL_ARXIV + "query?" + params.toString();
        console.log("URL appelée:", url_complete);

        const response = await fetch(url_complete, {
            method: "GET",
            headers: { "Accept": "application/xml" }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP arXiv: ${response.status}`);
        }

        const xml_text = await response.text();
        console.log("XML reçu (premiers 500 caractères):", xml_text.substring(0, 500));

        const jsonData = await parseStringPromise(xml_text);
        
        const entries = jsonData.feed?.entry || [];
        
        const articles = entries.map((entry: any) => ({
            id: entry.id?.[0],
            title: entry.title?.[0],
            authors: entry.author?.map((a: any) => a.name?.[0]) || [],
            published: entry.published?.[0],
            summary: entry.summary?.[0],
            arxivUrl: entry.id?.[0]?.replace('http://arxiv.org/abs/', 'https://arxiv.org/abs/'),
        }));

        console.log("Articles trouvés:", articles.length);
        
        return res.json({
            status: "Success",
            totalResults: entries.length,
            articles: articles
        });

    } catch (error) {
        console.error("Erreur arXiv:", error);
        return res.status(500).json({
            status: "Failed",
            message: "Erreur lors de la récupération des données arXiv",
            error: error.message
        });
    }
}

function shuffleInterests(interests) {
    console.log("interests ", interests);

    // Extraire les valeurs des catégories arXiv
    let interestsValues = interests.map((interest: any) => 
        typeof interest === 'string' ? interest : interest.value
    );

    // Utiliser tous les intérêts avec OR pour chercher dans tous les domaines
    let interestsParameters = interestsValues.map((elem) => "cat:" + elem );    
    console.log("interestsParameters", interestsParameters);
    return interestsParameters;

}

function randomI(interests) {
    let index = JSON.stringify(Math.floor(Math.random() * interests.length));
    return index;
}


export default handleArxiv;