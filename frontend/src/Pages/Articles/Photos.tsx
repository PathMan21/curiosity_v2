function Photos({ title, date, url, description, photographer, photographerUrl }: any) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <article>
      <div className="row align-items-start">
        <div className="col-md-4 mb-3 mb-md-0 text-center">
          {url && (
            <img
              src={url}
              alt={title || "Photo"}
              className="img-fluid rounded-2 shadow-sm"
              style={{ maxHeight: "250px", objectFit: "cover" }}
            />
          )}
        </div>

        <div className="col-md-8">
          <h5 className="mb-2">
            <strong>{title}</strong>
          </h5>

          <div className="mb-2 text-muted small">
            <span>{formatDate(date)}</span>
            {photographer && (
              <>
                {" • "}
                {photographerUrl ? (
                  <a
                    href={photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-decoration-none text-secondary"
                  >
                    {photographer}
                  </a>
                ) : (
                  <span>{photographer}</span>
                )}
              </>
            )}
          </div>

          <p className="mb-3">{truncateText(description)}</p>

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-primary"
            >
              Voir la photo
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default Photos;
