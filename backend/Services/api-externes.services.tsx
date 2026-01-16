// commencer par arXiv

import { configDotenv } from "dotenv";
import { parseStringPromise } from "xml2js";
import User from "../Models/User";
import interestsData from '../Assets/interests.json';
import { link } from "fs";

async function handleOpenAlex(req, res) {
    try {
        console.log("OpenAlex - récupération des données");
        const userJWT = req.user.userId;
        const user = await User.findOne({ where: { id: userJWT} });
        
        let userInterests = JSON.parse(user.interests);
        console.log("Intérêts utilisateur:", userInterests);
        
        // Convertir les intérêts en IDs de concepts OpenAlex
        let conceptIds = mapInterestsToConceptIds(userInterests);
        console.log("Concept IDs:", conceptIds);
        
        if (conceptIds.length === 0) {
            return res.status(400).json({
                status: "Failed",
                message: "Aucun intérêt valide trouvé"
            });
        }
        
        // Combiner les IDs avec | (OR)
        let conceptFilter = conceptIds.join("|");
        
        // Pagination aléatoire
        let randomPage = Math.floor(Math.random() * 100) + 1;
        
        // 🎯 FILTRAGE PAR CONCEPTS
        let url_complete = `https://api.openalex.org/works?filter=concepts.id:${conceptFilter}&per_page=20&page=${randomPage}&sort=cited_by_count:desc`;
        
        console.log("URL appelée:", url_complete);

        const response = await fetch(url_complete, {
            method: "GET",
            headers: { 
                "Accept": "application/json",
                "User-Agent": "mailto:[email protected]" // CHANGEZ CECI
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erreur OpenAlex:", errorText);
            throw new Error(`Erreur HTTP OpenAlex: ${response.status}`);
        }

        const jsonData = await response.json();
        console.log("Méta données:", jsonData.meta);
        
        const results = jsonData.results || [];
        
        // 🎯 FILTRAGE PAR TOPICS (plus précis que concepts)
        let filteredResults = results.filter(element => {
            if (!element || !element.topics) return false;
            
            // Vérifier si AU MOINS UN topic pertinent (score >= 0.7)
            const hasRelevantTopic = element.topics.some(t => t.score >= 0.7);
            
            return hasRelevantTopic;
        });
        
        console.log(`📊 Résultats avant filtrage: ${results.length}`);
        console.log(`📊 Résultats après filtrage: ${filteredResults.length}`);
        
        const articles = filteredResults.map((work: any) => {
            // Extraire les topics pertinents (score >= 0.7)
            const relevantTopics = work.topics
                ?.filter(t => t.score >= 0.7)
                .sort((a, b) => b.score - a.score) || [];
            
            // Le topic principal (meilleur score)
            const primaryTopic = relevantTopics[0];
            
            return {
                id: work.id,
                title: work.title,
                authors: work.authorships
                    ?.slice(0, 5)
                    .map((a: any) => a.author?.display_name)
                    .filter(Boolean) || [],
                published: work.publication_date,
                summary: work.abstract_inverted_index 
                    ? reconstructAbstract(work.abstract_inverted_index) 
                    : "Résumé non disponible",
                openAlexUrl: work.id,
                doi: work.doi,
                pdfUrl: work.open_access?.oa_url || null,
                isOpenAccess: work.open_access?.is_oa || false,
                citationCount: work.cited_by_count || 0,
                publicationYear: work.publication_year,
                venue: work.primary_location?.source?.display_name || null,
                type: work.type || "article",
                link: work.doi ? `https://doi.org/${work.doi}` : work.id,
                
                // 🎯 TOPICS (meilleure classification)
                topics: relevantTopics.slice(0, 3).map(t => ({
                    name: t.display_name,
                    score: t.score,
                    percentage: Math.round(t.score * 100) + '%',
                    field: t.field?.display_name || null,
                    subfield: t.subfield?.display_name || null,
                    domain: t.domain?.display_name || null
                })),
                
                // Topic principal
                mainTopic: primaryTopic?.display_name || "General",
                topicScore: primaryTopic?.score || 0,
                field: primaryTopic?.field?.display_name || null,
                domain: primaryTopic?.domain?.display_name || null,
                
                // Concepts (pour compatibilité)
                concepts: work.concepts
                    ?.slice(0, 5)
                    .map((c: any) => ({
                        name: c.display_name,
                        score: c.score,
                        level: c.level
                    })) || []
            };
        });

        console.log(`✅ Articles retournés: ${articles.length}`);
        
        return res.json({
            status: "Success",
            totalResults: jsonData.meta?.count || 0,
            filteredCount: articles.length,
            currentPage: randomPage,
            articles: articles
        });

    } catch (error) {
        console.error("Erreur OpenAlex:", error);
        return res.status(500).json({
            status: "Failed",
            message: "Erreur lors de la récupération des données OpenAlex",
            error: error.message
        });
    }
}

function mapInterestsToConceptIds(interestIds: string[]): string[] {
    return interestIds
        .map(interestId => {
            const interest = interestsData.interests.find(i => i.id === interestId);
            
            if (!interest) {
                console.warn(`⚠️ Intérêt "${interestId}" non trouvé`);
                return null;
            }
            
            if (!interest.openalex_concept_id) {
                console.warn(`⚠️ Pas d'openalex_concept_id pour "${interestId}"`);
                return null;
            }
            
            return interest.openalex_concept_id;
        })
        .filter(Boolean) as string[];
}

function reconstructAbstract(invertedIndex: any): string {
    if (!invertedIndex || typeof invertedIndex !== 'object') {
        return "Résumé non disponible";
    }
    
    try {
        const words: string[] = [];
        
        for (const [word, positions] of Object.entries(invertedIndex)) {
            if (Array.isArray(positions)) {
                positions.forEach((pos: number) => {
                    words[pos] = word;
                });
            }
        }
        
        const fullAbstract = words.filter(Boolean).join(' ');
        
        if (fullAbstract.length > 500) {
            return fullAbstract.substring(0, 500) + '...';
        }
        
        return fullAbstract || "Résumé non disponible";
        
    } catch (error) {
        console.error("Erreur reconstruction résumé:", error);
        return "Résumé non disponible";
    }
}

export default handleOpenAlex;