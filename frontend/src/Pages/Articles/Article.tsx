import React from "react";

function Article({ title, date, excerpt, author, thumbnail }: any) {
    return (
        <article className="card mb-4 shadow-sm">
            <div className="row g-0 align-items-center">
                {thumbnail ? (
                    <div className="col-md-3">
                        <img
                            src={thumbnail}
                            alt={title}
                            className="img-fluid rounded-start"
                            style={{ objectFit: "cover", height: "100%" }}
                        />
                    </div>
                ) : null}

                <div className={thumbnail ? "col-md-9" : "col-12"}>
                    <div className="card-body">
                        <h3 className="card-title mb-2">{title}</h3>
                        <p className="card-text text-muted small mb-2">
                            <i className="far fa-calendar"></i> {date} {author ? `· ${author}` : ""}
                        </p>
                        {excerpt && <p className="card-text mb-3">{excerpt}</p>}

                        <div className="d-flex justify-content-between align-items-center">
                            <div className="btn-group">
                                <a href="#" className="btn btn-sm btn-outline-primary">
                                    Lire
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default Article;