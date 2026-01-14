import React from "react";

function Article({ title, date, excerpt, author, thumbnail, url }: any) {
    // Formater la date
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        try {
            return new Date(dateStr).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    // Limiter le résumé à 300 caractères
    const truncateExcerpt = (text: string, maxLength: number = 300) => {
        if (!text) return "";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    return (
        <article className="mb-4 p-4 border rounded-2 bg-white shadow-sm">
            <div className="row align-items-start">
                {thumbnail && (
                    <div className="col-md-2 mb-3 mb-md-0">
                        <img
                            src={thumbnail}
                            alt={title}
                            className="img-fluid rounded"
                            style={{ maxHeight: "150px", objectFit: "cover" }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                    </div>
                )}
                <div className={thumbnail ? "col-md-10" : "col-12"}>
                    <h5 className="mb-2">
                        <strong>{title}</strong>
                    </h5>
                    <div className="mb-2 text-muted small">
                        <span>📅 {formatDate(date)}</span>
                        {author && <span> • ✍️ {author}</span>}
                    </div>
                    <p className="mb-3">{truncateExcerpt(excerpt)}</p>
                    {url && (
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary"
                        >
                            Lire l'article →
                        </a>
                    )}
                </div>
            </div>
        </article>
    );
}

export default Article;