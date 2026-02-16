function ProfileInfo(props) {
  let interestArray
  if (props.interests) {
    interestArray = JSON.parse(props.interests)
  }
  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body text-center">
              {props.img && (
                <img
                  src={props.img}
                  alt="profile"
                  className="rounded-circle mb-3"
                  style={{
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover',
                  }}
                  referrerPolicy="no-referrer"
                />
              )}
              <h3 className="card-title mb-3">{props ? props.username : ''}</h3>
              <h6 className="card-subtitle mb-2 text">
                {props ? props.email : ''}
              </h6>

              <p className="card-subtitle mb-2 text-muted">
                {interestArray ? interestArray.join(' ') : ''}
              </p>
              <div className="mt-4">
                <a
                  href="/Profile/settings"
                  className="btn btn-outline-primary me-2"
                >
                  Paramètres
                </a>
                <a
                  href="/Profile/Favorites"
                  className="btn btn-outline-secondary"
                >
                  Favoris
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileInfo
