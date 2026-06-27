function ProfileInfo(props: {
  img?: string
  email?: string
  interests?: string
  username?: string
}) {
  let interestArray: string[] = []
  if (props.interests) {
    try {
      interestArray = JSON.parse(props.interests)
    } catch {
      interestArray = []
    }
  }

  return (
    <div className="profile-info-container page-with-nav">
      <div className="profile-info-wrapper">
        {/* Hero card */}
        <div className="glass-card p-0 overflow-hidden mb-4">
          {/* Banner */}
          <div className="profile-banner">
            <div className="profile-avatar-wrapper">
              {props.img ? (
                <img
                  src={props.img}
                  alt={`Photo de profil de ${props.username}`}
                  referrerPolicy="no-referrer"
                  className="profile-avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {props.username ? props.username[0].toUpperCase() : '?'}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="profile-info-section">
            <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
              <div>
                <h1 className="profile-info-header">
                  {props.username || 'Utilisateur'}
                </h1>
                <p className="profile-info-email">{props.email}</p>
              </div>
              <a
                href="/Profile/settings"
                className="btn btn-outline-primary btn-sm"
              >
                ⚙️ Paramètres
              </a>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass-card p-4">
          <div className="section-title mb-3">Mon compte</div>
          <div className="d-flex flex-column gap-2">
            <a href="/Profile/settings" className="profile-quick-action-link">
              <span className="profile-action-icon">⚙️</span> Paramètres du
              profil
              <span className="profile-action-arrow">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileInfo
