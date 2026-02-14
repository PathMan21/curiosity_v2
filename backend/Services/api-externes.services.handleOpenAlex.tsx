import { configDotenv } from "dotenv";
import { parseStringPromise } from "xml2js";
import User from "../Models/User";
import interestsData from '../Assets/interests.json';
import { link } from "fs";
import redisClient from "../Config/redis.conf";

async function handleOpenAlex(req, res) {
    try {
        const defaultExpiration = 3600 * 24 * 7; 
        const userJWT = req.userId;
        const user = await User.findOne({ where: { id: userJWT } });
        const userInterests = JSON.parse(user.interests || "[]");
        const subfieldIds = mapInterestsToSubfields(userInterests);

        if (!subfieldIds || subfieldIds.length === 0) {
            return res.status(400).json({
                status: "Failed",
                message: "Aucun intérêt valide trouvé"
            });
        }

        const currentYear = new Date().getFullYear();
        const allResults = [];
        const headers = {
            "Accept": "application/json",
            "User-Agent": "mailto:curiosity.the.social.network@gmail.com"
        };

        for (const item of subfieldIds) {
            const subfieldId = item.subfield;
            const cacheKey = `handle-open-alex-${subfieldId}`;

            let cachedData = null;
            try {
                const raw = await redisClient.get(cacheKey) as string;
                if (raw) {
                    cachedData = JSON.parse(raw);
                }
            } catch (err) {
                console.warn(`⚠️ Erreur lecture Redis (${cacheKey}):`, err.message);
            }

            if (cachedData && (cachedData.articles) && cachedData.articles.length > 0) {
                console.log(`✅ Données trouvées dans le cache pour ${subfieldId}`);
                allResults.push(...cachedData.articles);
                continue;
            } else {
                    const maxPages = 10; 
                    const perPage = 10;
                        const allFetched = [];

                    console.log(`🔍 Aucun cache trouvé pour ${subfieldId} - Appel OpenAlex énorme`);
                    for (let page = 1; page <= maxPages; page++) {
                                const recentUrl = `https://api.openalex.org/works?filter=topics.subfield.id:${subfieldId},is_oa:true,publication_year:${currentYear-1}-${currentYear}&per_page=${perPage}&page=${page}&sort=cited_by_count:desc`;

                                const response = await fetch(recentUrl, { method: "GET", headers });
                                if (!response.ok) {
                                    console.warn(`⚠️ API OpenAlex non OK pour ${subfieldId}:`, response.status);
                                    continue;
                                }
                        const data = await response.json();
                                if (!data.results || data.results.length === 0) break;

                                allFetched.push(...data.results);


                        if (data.results.length < perPage) break;
                    }
                        const filtered = allFetched.filter(e =>
                        e && e.topics && e.topics.some(t => t.score >= 0.75)
                        );
                    try {

                        await redisClient.setEx(cacheKey, defaultExpiration, JSON.stringify({
                            subfieldId,
                            totalResults: filtered.length,
                            articles: filtered
                        }));
                        console.log(`💾 Mise en cache réussie pour ${cacheKey}`);
                    } catch (err) {
                        console.warn(`⚠️ Impossible d'écrire dans Redis (${cacheKey}):`, err.message);
                    }

                    allResults.push(...filtered);
            }

        }

        const uniqueResults = dedupeWorksById(allResults);
        const finalResults = shuffleArray(uniqueResults).slice(0, 20);

        const articles = finalResults.map((work) => {
            const relevantTopics = (work.topics || [])
                .filter(t => t.score >= 0.75)
                .sort((a, b) => b.score - a.score);
            const primaryTopic = relevantTopics[0];

            return {
                id: work.id,
                title: work.title,
                authors: work.authorships?.slice(0, 5).map(a => a.author?.display_name).filter(Boolean) || [],
                published: work.publication_date,
                summary: work.abstract_inverted_index ? reconstructAbstract(work.abstract_inverted_index) : "Résumé non disponible",
                openAlexUrl: work.id,
                doi: work.doi,
                pdfUrl: work.open_access?.oa_url || null,
                isOpenAccess: work.open_access?.is_oa || false,
                publicationYear: work.publication_year,
                type: work.type || "article",
                link: work.doi ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}` : work.id,
                mainTopic: primaryTopic?.display_name || "General",
                topicScore: primaryTopic?.score || 0,
                concepts: primaryTopic?.field?.display_name || null,
            };
        });

        return res.json({
            status: "Success",
            source: "api+cache",
            totalResults: allResults.length,
            filteredCount: articles.length,
            subfieldCount: subfieldIds.length,
            articles
        });

    } catch (error) {
        console.error("❌ Erreur OpenAlex:", error);
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

function dedupeWorksById(works = []) {
    const seen = new Set();
    const out = [];
    for (const w of works) {
        if (!w || !w.id) continue;
        if (!seen.has(w.id)) {
            seen.add(w.id);
            out.push(w);
        }
    }
    return out;
}
export default handleOpenAlex;