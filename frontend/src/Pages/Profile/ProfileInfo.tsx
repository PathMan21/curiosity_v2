function ProfileInfo(props) {
  let interestArray: string[] = []
  if (props.interests) {
    try { interestArray = JSON.parse(props.interests) } catch { interestArray = [] }
  }

  return (
    // ✅ RGAA 9.2 — landmark <main>
    <main id="contenu-principal" className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body text-center">

              {props.img ? (
                // ✅ RGAA 1.1 — alt descriptif pour la photo de profil
                <img
                  className="img-thumbnail mx-auto rounded"
                  src={props.img}
                  alt={`Photo de profil de ${props.username}`}
                  referrerPolicy="no-referrer"
                />
              ) : (
                // ✅ RGAA 1.2 — avatar généré = décoratif, alt vide + aria-hidden
                <div aria-hidden="true" role="img" aria-label={`Initiale de ${props.username}`}>
                  {props.username ? props.username[0].toUpperCase() : '?'}
                </div>
              )}

            </div>

            {/* ✅ RGAA 9.1 — structuration avec h1 puis éléments non-titre */}
            {/* Les <label> sans input associé sont remplacés par des <p> sémantiques */}
            <div className="mb-1 text-center">
              <h1 className="h5 mb-1">{props.username}</h1>
            </div>

            <div className="mb-1 text-center">
              {/* ✅ <p> au lieu de <label> non associé à un champ */}
              <p className="mb-0">{props.email}</p>
            </div>

            {interestArray && interestArray.length > 0 && (
              <div className="text-center mb-1 text-muted">
                {/* ✅ RGAA 9.3 — liste sémantique pour les centres d'intérêt */}
                <p className="visually-hidden">Centres d'intérêt :</p>
                <ul className="list-inline">
                  {interestArray.map((interest: string, i: number) => (
                    <li key={i} className="list-inline-item">
                      {interest}{i < interestArray.length - 1 ? ' –' : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <nav aria-label="Navigation du profil">
              <div className="text-center mb-1 fw-bold">
                {/* ✅ RGAA 6.1 — intitulés de liens explicites */}
                <a className="btn btn-outline-primary w-10" href="/Profile/settings">
                  Paramètres du profil
                </a>
              </div>
              <div className="text-center mb-1 fw-bold">
                <a className="btn btn-outline-primary w-10" href="/Profile/Favorites">
                  Mes articles favoris
                </a>
              </div>
            </nav>

          </div>
        </div>
      </div>
    </main>
  )
}

export default ProfileInfo
