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
        
        let subfieldIds = mapInterestsToSubfields(userInterests);
        console.log("Subfield IDs:", subfieldIds);
        
        if (subfieldIds.length === 0) {
            return res.status(400).json({
                status: "Failed",
                message: "Aucun intérêt valide trouvé"
            });
        }
        
        const currentYear = new Date().getFullYear();
        let allResults = [];
        
        // Calculer combien d'articles par subfield
        const articlesPerSubfield = Math.ceil(20 / subfieldIds.length);
        const recentPerSubfield = Math.ceil(14 / subfieldIds.length); // 70%
        const mediumPerSubfield = Math.ceil(4 / subfieldIds.length);  // 20%
        const oldPerSubfield = Math.ceil(2 / subfieldIds.length);     // 10%
        
        // Faire une requête séparée pour CHAQUE subfield
        for (const subfieldId of subfieldIds) {
            const randomPage = Math.floor(Math.random() * 20) + 1;
            
            // Articles récents pour ce subfield
            let recentUrl = `https://api.openalex.org/works?filter=topics.subfield.id:${subfieldId},is_oa:true,publication_year:${currentYear-1}-${currentYear}&per_page=${recentPerSubfield}&page=${randomPage}&sort=cited_by_count:desc`;
            
            console.log(`📅 Récents [${subfieldId}]:`, recentUrl);
            
            const recentResponse = await fetch(recentUrl, {
                method: "GET",
                headers: { 
                    "Accept": "application/json",
                    "User-Agent": "mailto:curiosity.the.social.network@gmail.com" 
                }
            });
            
            if (recentResponse.ok) {
                const recentData = await recentResponse.json();
                allResults = [...allResults, ...(recentData.results || [])];
                console.log(`  ✅ ${recentData.results?.length || 0} articles récents`);
            }
            
            // Articles moyens pour ce subfield
            let mediumUrl = `https://api.openalex.org/works?filter=topics.subfield.id:${subfieldId},is_oa:true,publication_year:${currentYear-5}-${currentYear-2}&per_page=${mediumPerSubfield}&page=${randomPage}&sort=cited_by_count:desc`;
            
            console.log(`📆 Moyens [${subfieldId}]:`, mediumUrl);
            
            const mediumResponse = await fetch(mediumUrl, {
                method: "GET",
                headers: { 
                    "Accept": "application/json",
                    "User-Agent": "mailto:curiosity.the.social.network@gmail.com" 
                }
            });
            
            if (mediumResponse.ok) {
                const mediumData = await mediumResponse.json();
                allResults = [...allResults, ...(mediumData.results || [])];
                console.log(`  ✅ ${mediumData.results?.length || 0} articles moyens`);
            }
            
            // Articles anciens pour ce subfield
            let oldUrl = `https://api.openalex.org/works?filter=topics.subfield.id:${subfieldId},is_oa:true,publication_year:2015-${currentYear-5}&per_page=${oldPerSubfield}&page=${randomPage}&sort=cited_by_count:desc`;
            
            console.log(`📜 Anciens [${subfieldId}]:`, oldUrl);
            
            const oldResponse = await fetch(oldUrl, {
                method: "GET",
                headers: { 
                    "Accept": "application/json",
                    "User-Agent": "mailto:curiosity.the.social.network@gmail.com" 
                }
            });
            
            if (oldResponse.ok) {
                const oldData = await oldResponse.json();
                allResults = [...allResults, ...(oldData.results || [])];
                console.log(`  ✅ ${oldData.results?.length || 0} articles anciens`);
            }
        }
        
        console.log(`📊 Total articles récupérés: ${allResults.length}`);
        
        // Filtrage qualité
        let filteredResults = allResults.filter(element => {
            if (!element || !element.topics) return false;
            const hasRelevantTopic = element.topics.some(t => t.score >= 0.75);
            return hasRelevantTopic && element.cited_by_count > 3;
        });
        
        console.log(`📊 Articles après filtrage: ${filteredResults.length}`);
        
        // Mélanger et limiter à 20
        filteredResults = shuffleArray(filteredResults).slice(0, 20);
        
        const articles = filteredResults.map((work: any) => {
            const relevantTopics = work.topics
                ?.filter(t => t.score >= 0.75)
                .sort((a, b) => b.score - a.score) || [];
            
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
                link: work.doi ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}` : work.id,
                
                topics: relevantTopics.slice(0, 3).map(t => ({
                    name: t.display_name,
                    score: t.score,
                    percentage: Math.round(t.score * 100) + '%',
                    field: t.field?.display_name || null,
                    subfield: t.subfield?.display_name || null,
                    domain: t.domain?.display_name || null
                })),
                
                mainTopic: primaryTopic?.display_name || "General",
                topicScore: primaryTopic?.score || 0,
                
                concepts: primaryTopic?.field?.display_name || null,
            };
        });

        console.log(`✅ Articles finaux retournés: ${articles.length}`);
        console.log(`📊 Distribution par subfield équilibrée`);
        
        return res.json({
            status: "Success",
            totalResults: allResults.length,
            filteredCount: articles.length,
            subfieldCount: subfieldIds.length,
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

function mapInterestsToSubfields(interestIds: string[]): string[] {
    const subfieldMapping = {
        "ai-ml": "1702",              // Computer Science -> Artificial Intelligence
        "computer-science": "1705",   // Computer Science -> Computer Networks and Communications
        "data-science": "2613",       // Mathematics -> Statistics and Probability
        "cybersecurity": "1712",      // Computer Science -> Computer Networks and Communications
        "robotics": "2207",           // Engineering -> Control and Systems Engineering
        "mathematics": "2604",        // Mathematics -> Applied Mathematics
        "physics": "3109",            // Physics and Astronomy -> Statistical and Nonlinear Physics
        "chemistry": "1605",          // Chemistry -> Organic Chemistry
        "biology": "1312",            // Biochemistry, Genetics and Molecular Biology -> Molecular Biology
        "medicine": "2725",           // Medicine -> General Medicine
        "neuroscience": "2801",       // Neuroscience -> Behavioral Neuroscience
        "ecology": "2303",            // Environmental Science -> Ecology
        "climate": "1902",            // Earth and Planetary Sciences -> Atmospheric Science
        "energy": "2105",             // Energy -> Renewable Energy, Sustainability and the Environment
        "economics": "2002",          // Economics, Econometrics and Finance -> Economics and Econometrics
        "finance": "2003",            // Economics, Econometrics and Finance -> Finance
        "psychology": "3204",         // Psychology -> Developmental and Educational Psychology
        "sociology": "3312",          // Social Sciences -> Sociology and Political Science
        "engineering": "2205",        // Engineering -> Civil and Structural Engineering
        "space": "3103",              // Physics and Astronomy -> Astronomy and Astrophysics
        "art": "1213",                // Arts and Humanities -> Visual Arts and Performing Arts
        "sport": "2732",              // Medicine -> Orthopedics and Sports Medicine
        "business": "1402"            // Business, Management and Accounting -> Strategy and Management
    };
    
    let subfields = new Set<string>();
    
    interestIds.forEach(interestId => {
        const subfieldId = subfieldMapping[interestId];
        if (subfieldId) {
            subfields.add(subfieldId);
        } else {
            console.warn(`⚠️ Intérêt "${interestId}" non mappé`);
        }
    });
    
    return Array.from(subfields);
}

function shuffleArray(array: any[]): any[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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