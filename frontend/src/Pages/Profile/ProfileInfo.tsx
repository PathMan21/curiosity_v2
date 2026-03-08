function ProfileInfo(props) {
  let interestArray
  if (props.interests) {
    try { interestArray = JSON.parse(props.interests) } catch { interestArray = [] }
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body text-center">
              {props.img ? (
                <img className="img-thumbnail mx-auto rounded"
                  src={props.img}
                  alt="profil"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div>
                  {props.username ? props.username[0].toUpperCase() : '?'}
                </div>
              )}
            </div>

            <div className="mb-1 text-center">
              <label className="form-label">
                {props.username}
              </label>

            </div>
            <div className="mb-1 text-center">

              <label className="form-label">
                {props.email}
              </label>
            </div>
            <div className="text-center mb-4 p-5 text-muted">

              {interestArray && interestArray.length > 0 && (
                <div>
                  {interestArray.map((interest: string, i: number) => (
                    <span key={i}>
                      {interest} -
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="text-center mb-1 fw-bold">
              <a className="btn btn-outline-primary w-10" href="/Profile/settings"
              >
                Paramètres
              </a>
            </div>
            <div className="text-center mb-1 fw-bold">
              <a className="btn btn-outline-primary w-10" href="/Profile/Favorites"
              >
                Favoris
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ProfileInfo
