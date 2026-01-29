
import dotenv from "dotenv";
import User from "../Models/User";
import { error } from "console";
async function handleUnsplash(req, res) {
    try {
        const baseUrl = process.env.BASE_URL_UNSPLASH;
        const userId = req.user.userId;

        const userConnected = await User.findOne({ where: { id: userId } });

        if (!userConnected) {
            throw new error("Utilisateur inconnu ou inéxistant");
        } else {
            let interests = JSON.parse(userConnected.interests);

            let unsplashInterest = await handleInterestsUnsplash(interests);
            let url = ""; 
            unsplashInterest.forEach(element => {
                url = `${baseUrl}/s/photos/${element}`;
            });
const response = await fetch(url, {
                method: "GET",
                headers: { "Accept": "application/json" }

            })
            console.log(url);
            if (!response.ok){
                throw new Error(`Erreur API (${response.status}): ${response.statusText}`);
            }

                const data = await response.json();
                console.log(data);
                    const photos = data.results;

                    photos.forEach(photo => {
                    console.log({
                        id: photo.id,
                        url: photo.urls.regular,        
                        thumb: photo.urls.thumb,       
                        description: photo.alt_description,
                        photographer: photo.user.name,
                        photographerLink: photo.user.links.html,
                        downloadLink: photo.links.download
                    });
                    });
            
            

            // fin de la fonction try
        }

    }
    catch (err) {
        console.log(err);


    }
}


function handleInterestsUnsplash(interests) {
    const interestToQuery = {
        "ai-ml": "artificial intelligence technology",
        "computer-science": "programming code screen",
        "cybersecurity": "cybersecurity digital lock",
        "robotics": "robot automation",
        "engineering": "engineering blueprint",
        "mathematics": "mathematics equations",
        "physics": "physics laboratory",
        "chemistry": "chemistry lab beaker",
        "biology": "biology microscope cells",
        "medicine": "medical research hospital",
        "neuroscience": "brain scan neuroscience",
        "ecology": "nature forest biodiversity",
        "climate": "climate earth atmosphere",
        "energy": "solar panels renewable energy",
        "economics": "economics graph chart",
        "finance": "stock market trading",
        "psychology": "psychology therapy mind",
        "sociology": "people community society",
        "business": "business meeting office",
        "space": "space galaxy stars",
        "art": "art museum painting",
        "sport": "sports athlete training"
    };

    const interestsQueries = interests.map(interest => ((interestToQuery[interest]).split(" ").join("-")));
    
    if (interestsQueries) {
        console.log("unsplash interest : ", interestsQueries);
        return interestsQueries;
    } else {
        return "astronomy";
    }
    

}

export default handleUnsplash;