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

            if (subfieldIds.length === 0) {
                return res.status(400).json({
                    status: "Failed",
                    message: "Aucun intérêt valide trouvé"
                });
            }

            const currentYear = new Date().getFullYear();
            let allResults = [];

            const recentPerSubfield = Math.ceil(5 / subfieldIds.length);
            const reviewsRecentSubfield = Math.ceil(9 / subfieldIds.length);
            const mediumPerSubfield = Math.ceil(4 / subfieldIds.length);
            const oldPerSubfield = Math.ceil(2 / subfieldIds.length);
        
        for (const item of subfieldIds) {
            let subfieldId = item.subfield;
            let journals = item.journals;
            const randomPage = Math.floor(Math.random() * 20) + 1;
            
            let recentUrl = `https://api.openalex.org/works?filter=topics.subfield.id:${subfieldId},primary_location.source.id:${journals},is_oa:true,publication_year:${currentYear-1}-${currentYear}&per_page=${recentPerSubfield}&page=${randomPage}&sort=cited_by_count:desc`;
            
            
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
                console.log(` ${recentData.results?.length || 0} articles récents`);
            }
            let reviewsUrl = `https://api.openalex.org/works?filter=topics.subfield.id:${subfieldId},primary_location.source.id:${journals},type:review,is_oa:true,publication_year:${currentYear-1}-${currentYear}&per_page=${reviewsRecentSubfield}&page=${randomPage}&sort=cited_by_count:desc&cited_by_count:>50`;
            
            console.log(`Articles reviews [${subfieldId}] :`, recentUrl);
            
            const reviewsResponse = await fetch(reviewsUrl, {
                method: "GET",
                headers: { 
                    "Accept": "application/json",
                    "User-Agent": "mailto:curiosity.the.social.network@gmail.com" 
                }
            });
            
            if (reviewsResponse.ok) {
                const reviewsData = await reviewsResponse.json();
                allResults = [...allResults, ...(reviewsData.results || [])];
                console.log(` ${reviewsData.results?.length || 0} articles récents`);
            }
            
            let mediumUrl = `https://api.openalex.org/works?filter=topics.subfield.id:${subfieldId},is_oa:true,publication_year:${currentYear-5}-${currentYear-2}&per_page=${mediumPerSubfield}&page=${randomPage}&sort=cited_by_count:desc`;
            
            console.log(`Articles Moyens [${subfieldId}] : `, mediumUrl);
            
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
            
            let oldUrl = `https://api.openalex.org/works?filter=topics.subfield.id:${subfieldId},is_oa:true,publication_year:2015-${currentYear-5}&per_page=${oldPerSubfield}&page=${randomPage}&sort=cited_by_count:desc`;
            
            console.log(`Articles anciens [${subfieldId}] : `, oldUrl);
            
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
                console.log(`  ${oldData.results?.length || 0} articles anciens`);
            }
        }
        
        console.log(`Articles totaux récupérés : ${allResults.length}`);
        
        let filteredResults = allResults.filter(element => {
            if (!element || !element.topics) return false;
            const hasRelevantTopic = element.topics.some(t => t.score >= 0.75);
            return hasRelevantTopic && element.cited_by_count > 3;
        });
        
        console.log(`📊 Articles après filtrage: ${filteredResults.length}`);
        
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

function mapInterestsToSubfields(interestIds: string[]): { subfield: string; journals: string[] }[] {
const subfieldMapping = {
    "ai-ml": {
        subfield: "1702",
        journals: ["S118930848", "S2764455087", "S114469174"]  
    },
    "computer-science": {
        subfield: "1705",
        journals: ["S118930848", "S2764455087", "S98762135"]  
    },
    "data-science": {
        subfield: "2613",
        journals: ["S2764455087", "S114469174", "S70535770"]  
    },
    "cybersecurity": {
        subfield: "1712",
        journals: ["S118930848", "S2764455087"]  
    },
    "robotics": {
        subfield: "2207",
        journals: ["S118930848", "S70535770", "S2764455087"]  
    },
    "mathematics": {
        subfield: "2604",
        journals: ["S2764455087", "S70535770"] 
    },
    "physics": {
        subfield: "3109",
        journals: ["S125754415", "S112505126", "S70535770"]  
    },
    "chemistry": {
        subfield: "1605",
        journals: ["S70535770", "S2764455087", "S4210170802"]  
    },
    "biology": {
        subfield: "1312",
        journals: ["S2764455087", "S156975444", "S2764486067", "S4210220386"] 
    },
    "medicine": {
        subfield: "2725",
        journals: ["S2764455087", "S202339397", "S152253655", "S156975444"]
    },
    "neuroscience": {
        subfield: "2801",
        journals: ["S2736105967", "S2764455087", "S156975444"]  
    },
    "ecology": {
        subfield: "2303",
        journals: ["S2764455087", "S156975444", "S100327389", "S4210170802"]  
    },
    "climate": {
        subfield: "1902",
        journals: ["S100319019", "S2764455087", "S70535770", "S4210193424"] 
    },
    "energy": {
        subfield: "2105",
        journals: ["S100319019", "S2764455087", "S70535770"]  
    },
    "economics": {
        subfield: "2002",
        journals: ["S2764455087", "S70535770"] 
    },
    "finance": {
        subfield: "2003",
        journals: ["S2764455087", "S70535770"] 
    },
    "psychology": {
        subfield: "3204",
        journals: ["S2736104481", "S2764455087", "S70535770"]  
    },
    "sociology": {
        subfield: "3312",
        journals: ["S2764455087", "S58730300", "S70535770"] 
    },
    "engineering": {
        subfield: "2205",
        journals: ["S118930848", "S70535770", "S2764455087"]  
    },
    "space": {
        subfield: "3103",
        journals: ["S125754415", "S70535770", "S2764455087"]  
    },
    "art": {
        subfield: "1213",
        journals: ["S2764455087", "S4210170802"]  
    },
    "sport": {
        subfield: "2732",
        journals: ["S2764455087", "S70535770", "S95457728"] 
    },
    "business": {
        subfield: "1402",
        journals: ["S2764455087", "S70535770"]  
    }
};

    const mappings: { subfield: string; journals: string[] }[] = [];

    for (const id of interestIds) {
        const mapping = subfieldMapping[id];
        if (mapping) {
            mappings.push({
                subfield: mapping.subfield,
                journals: mapping.journals
            });
        } else {
            console.warn(`⚠️ Intérêt "${id}" non mappé`);
        }
    }

    console.log("✅ Mappings trouvés :", mappings);
    return mappings;
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