// commencer par arXiv

import { configDotenv } from "dotenv";
import { parseStringPromise } from "xml2js";

async function handleArxiv(req, res) {
    try {
        console.log("arxiv - récupération des données");
        
        let params = new URLSearchParams({
            search_query: 'ti:quantum computing',
            start: '0',
            max_results: '10'
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

        // Parser le XML avec xml2js
        const jsonData = await parseStringPromise(xml_text);
        
        // Extraire les articles du parseur XML
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

export default handleArxiv;