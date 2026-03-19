
import dotenv from 'dotenv'
import interestsData from '../Assets/interests.json'
import { User } from '../Models'
import redisClient from '../Config/redis.conf'

async function handleOpenLibrary(req, res) {
  try {
    const baseUrl = `https://openlibrary.org`;
    const userJWT = req.user.userId;

    const user = await User.findOne({ where: { id: userJWT } });
    if (!user) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Utilisateur non trouvé',
      });
    }

    const userInterests = JSON.parse(user.interests);
    const openLibraryCategories = mapInterestsToOpenLibrary(userInterests);

    const searchTerms = openLibraryCategories.flat().join(" ");
    const actualUrl = `${baseUrl}/search.json?q=${encodeURIComponent(searchTerms)}&has_fulltext=true&language=eng&limit=5`;

    const response = await fetch(actualUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return res.status(500).json({ status: 'Failed', message: 'Erreur OpenLibrary' });
    }

    const books = await response.json();

    const booksArray = await Promise.all(
      books.docs.map(async (book) => {
        try {
          const workRes = await fetch(`${baseUrl}${book.key}.json`);
          if (!workRes.ok) return null;

          const result = await workRes.json();

          let coverUrl = null;
          if (book.cover_i) {
            coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
          } else if (result.covers && result.covers.length > 0) {
            coverUrl = `https://covers.openlibrary.org/b/id/${result.covers[0]}-L.jpg`;
          }

          const author = book.author_name?.join(", ") || "Unknown";

          let description = "";
          if (result.description) {
            description =
              typeof result.description === "string"
                ? result.description
                : result.description.value || "";
          }

          return {
            title: result.title,
            author,
            description,
            subject: openLibraryCategories.flat(),
            cover: coverUrl,
          };
        } catch (err) {
          console.error("Erreur fetch livre:", err);
          return null;
        }
      })
    );

    const filteredBooks = booksArray.filter((b) => b !== null);
    console.log(filteredBooks);
    return res.json({ status: 'Success', data: filteredBooks });

  } catch (err) {
    console.error("Erreur générale:", err);
    return res.status(500).json({ status: 'Failed', message: 'Erreur serveur' });
  }
}

function mapInterestsToOpenLibrary(interestIds) {
  const categories = [];
  const categories_subject = { 
    mathematics: ["algebra", "geometry", "calculus", "statistics", "probability", "number theory"], 
    robotics: ["automation", "control systems", "embedded systems", "computer vision", "robot kinematics"], 
    physics: ["mechanics", "thermodynamics", "quantum physics", "optics", "electromagnetism"], 
    chemistry: ["organic chemistry", "inorganic chemistry", "biochemistry", "analytical chemistry", "physical chemistry"], 
    biology: ["genetics", "microbiology", "cell biology", "evolution", "zoology"], 
    medicine: ["clinical research", "pathology", "pharmacology", "surgery", "public health"], 
    neurosciences: ["cognitive neuroscience", "neurobiology", "brain imaging", "neuropsychology", "neural networks"], 
    ecology: ["ecosystems", "biodiversity", "conservation", "environmental science", "wildlife management"], 
    climatology: ["climate change", "meteorology", "atmospheric science", "global warming", "climate modeling"], 
    energy: ["renewable energy", "solar power", "wind energy", "energy storage", "nuclear energy"], 
    economics: ["microeconomics", "macroeconomics", "econometrics", "development economics", "behavioral economics"], 
    finance: ["investment", "corporate finance", "financial markets", "risk management", "accounting"], 
    psychology: ["cognitive psychology", "behavioral psychology", "clinical psychology", "developmental psychology", "social psychology"], 
    sociology: ["social theory", "inequality", "culture", "demography", "urban studies"], 
    engineering: ["mechanical engineering", "electrical engineering", "civil engineering", "software engineering", "systems engineering"], 
    astronomy: ["astrophysics", "cosmology", "planetary science", "space exploration", "stellar evolution"], 
    art: ["painting", "sculpture", "photography", "digital art", "art history"], 
    sports: ["fitness", "training", "sports science", "nutrition", "athletics"], 
    business: ["management", "marketing", "entrepreneurship", "strategy", "operations"] 
  };

  interestIds.forEach((interestId) => {
    const interest = interestsData.interests.find((i) => i.id === interestId);
    if (!interest?.open_library) return;

    const subjects = categories_subject[interest.open_library];
    if (subjects) {
      const random = subjects[getRandomInt(0, subjects.length - 1)];
      categories.push([interest.open_library, random]);
    }
  });

  return categories;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export default handleOpenLibrary;