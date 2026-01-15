import React, { useState, useEffect } from "react";
import Article from "./Article";
// import HeaderSite from "../../Components/HeaderSite";
import FooterSite from "../../Components/FooterSite";
import NavbarSite from "../../Components/NavbarSite";
import { useAuth } from "../../Context/AuthContext";
import { fetchWithAuth } from "../../Services/apiClient";

function ArticlePage(props) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const { token } = useAuth();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);

        const response = await fetchWithAuth("/data/generalInfos", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Articles reçus:", data);

        if (data.articles && Array.isArray(data.articles)) {
          setArticles(data.articles);
        } else {
          throw new Error("Format de réponse invalide");
        }
      } catch (err) {
        console.error("Erreur:", err);
        setError(err.message);
        // Articles par défaut en cas d'erreur
        const sampleArticles = [
          {
            title: "Comment apprendre React",
            date: "2025-12-23",
            excerpt:
              "Un guide rapide pour commencer avec React et construire des interfaces modernes.",
            author: "Manon",
          },
          {
            title: "Design d'interface cohérent",
            date: "2025-11-15",
            excerpt:
              "Conseils pour espacer et aligner vos composants pour une meilleure lisibilité.",
            author: "Equipe",
          },
          {
            title: "Productivité avec Vite",
            date: "2025-10-01",
            excerpt: "Optimiser votre workflow frontend avec Vite et HMR.",
            author: "Dev",
          },
        ];
        setArticles(sampleArticles);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [token]);

  return (
    <>
      {/* <HeaderSite /> */}
      <NavbarSite />

      <main className="container my-5">
        <h1 className="mb-4">Articles</h1>

        {error && (
          <div className="alert alert-warning" role="alert">
            Attention: {error}. Affichage des articles par défaut.
          </div>
        )}

        {loading && (
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        )}

        <div className="row">
          <div className="col-12">
            {articles.map((a, idx) => (
              <Article
                key={idx}
                title={a.title}
                date={a.published || a.date}
                excerpt={a.summary || a.excerpt}
                author={a.authors?.[0] || a.author}
                thumbnail={a.thumbnail}
                url={a.arxivUrl}
              />
            ))}
          </div>
        </div>
      </main>

      <FooterSite />
    </>
  );
}

export default ArticlePage;
