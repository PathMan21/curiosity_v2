import User from "../Models/User"; // adapte le chemin selon ton projet

const handleInterestsUnsplash = (interests: string[]) => {
    const interestToQuery: { [key: string]: string } = {
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

    return interests.map(interest => interestToQuery[interest]).filter(Boolean);
};

export const handleUnsplash = async (req, res) => {
    try {
        const baseUrl = process.env.BASE_URL_UNSPLASH || "https://api.unsplash.com";
        const clientId = process.env.API_KEY_UNSPLASH;
        const userId = req.user?.id || req.user?.userId;

        if (!userId) {
            return res.status(401).json({ status: "Failed", message: "Utilisateur non authentifié" });
        }

        const userConnected = await User.findByPk(userId);

        if (!userConnected) {
            return res.status(404).json({ status: "Failed", message: "Utilisateur inconnu" });
        }

        // Parse les intérêts
        let interests: string[] = [];
        try {
            interests = JSON.parse(userConnected.dataValues.interests || "[]");
        } catch (e) {
            console.warn("Impossible de parser les intérêts :", e);
        }

        if (interests.length === 0) {
            return res.json({ status: "Success", photos: [] });
        }

        const unsplashInterests = handleInterestsUnsplash(interests);

        const allPhotos: any[] = [];

        // On fait une requête par intérêt
        for (const interest of unsplashInterests) {
            const url = `${baseUrl}/search/photos?query=${encodeURIComponent(interest)}&client_id=${clientId}&per_page=10`;
            
            const response = await fetch(url, {
                method: "GET",
                headers: { "Accept": "application/json" }
            });

            if (!response.ok) {
                console.warn(`Erreur Unsplash pour ${interest} : ${response.status} ${response.statusText}`);
                continue; // passe à l'intérêt suivant
            }

            const data = await response.json();
            const photos = data.results.map(photo => ({
                id: photo.id,
                url: photo.urls.regular,
                thumb: photo.urls.thumb,
                description: photo.alt_description,
                photographer: photo.user.name,
                photographerLink: photo.user.links.html,
                downloadLink: photo.links.download
            }));

            allPhotos.push(...photos);
        }

        return res.json({ status: "Success", photos: allPhotos });

    } catch (err) {
        console.error("Erreur getUnsplashPhotos :", err);
        return res.status(500).json({ status: "Failed", message: "Erreur serveur" });
    }
};

export default handleUnsplash;