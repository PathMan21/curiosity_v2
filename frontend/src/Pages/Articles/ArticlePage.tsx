import React from "react";
import Article from "./Article";
// import HeaderSite from "../../Components/HeaderSite";
import FooterSite from "../../Components/FooterSite";
import NavbarSite from "../../Components/NavbarSite";

function ArticlePage(props) {
    const sampleArticles = props.articles || [
        { title: "Comment apprendre React", date: "2025-12-23", excerpt: "Un guide rapide pour commencer avec React et construire des interfaces modernes.", author: "Manon" },
        { title: "Design d'interface cohérent", date: "2025-11-15", excerpt: "Conseils pour espacer et aligner vos composants pour une meilleure lisibilité.", author: "Equipe" },
        { title: "Productivité avec Vite", date: "2025-10-01", excerpt: "Optimiser votre workflow frontend avec Vite et HMR.", author: "Dev" }
    ];

    return (
        <>
            {/* <HeaderSite /> */}
            <NavbarSite />

            <main className="container my-5">
                <h1 className="mb-4">Articles</h1>

                <div className="row">
                    <div className="col-12">
                        {sampleArticles.map((a, idx) => (
                            <Article
                                key={idx}
                                title={a.title}
                                date={a.date}
                                excerpt={a.excerpt}
                                author={a.author}
                                thumbnail={a.thumbnail}
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