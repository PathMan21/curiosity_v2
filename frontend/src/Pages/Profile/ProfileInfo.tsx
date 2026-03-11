import FooterSite from "../../Components/FooterSite"
import NavbarSite from "../../Components/NavbarSite"

function ProfileInfo(props) {
  let interestArray: string[] = []
  if (props.interests) {
    try { interestArray = JSON.parse(props.interests) } catch { interestArray = [] }
  }

  return (
    <div>
    <NavbarSite></NavbarSite>

    <main id="contenu-principal" className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body text-center">

              {props.img ? (
                <img
                  className="img-thumbnail mx-auto rounded"
                  src={props.img}
                  alt={`Photo de profil de ${props.username}`}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div aria-hidden="true" role="img" aria-label={`Initiale de ${props.username}`}>
                  {props.username ? props.username[0].toUpperCase() : '?'}
                </div>
              )}

            </div>

            <div className="mb-1 text-center">
              <h1 className="h5 mb-1">{props.username}</h1>
            </div>

            <div className="mb-1 text-center">
              <p className="mb-0">{props.email}</p>
            </div>

            {interestArray && interestArray.length > 0 && (
              <div className="text-center mb-1 text-muted">
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
    <FooterSite></FooterSite>
    </div>
  )
}

export default ProfileInfo
