function ProfileInfo(props: {
  img?: string
  email?: string
  interests?: string
  username?: string
}) {
  let interestArray: string[] = []
  if (props.interests) {
    try { interestArray = JSON.parse(props.interests) } catch { interestArray = [] }
  }

  return (
    <div className="page-with-nav" style={{ minHeight: '100vh', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>

        {/* Hero card */}
        <div className="glass-card p-0 overflow-hidden mb-4">
          {/* Banner */}
          <div style={{
            height: '120px',
            background: 'linear-gradient(135deg, #e8e0f8 0%, #fce4ec 50%, #e3f0ff 100%)',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              bottom: '-44px',
              left: '1.5rem',
            }}>
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
          <div style={{ padding: '3rem 1.5rem 1.5rem' }}>
            <div className="d-flex align-items-start justify-content-between flex-wrap gap-2">
              <div>
                <h1 style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '1.4rem', marginBottom: '0.15rem' }}>
                  {props.username || 'Utilisateur'}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                  {props.email}
                </p>
              </div>
              <a href="/Profile/settings" className="btn btn-outline-primary btn-sm">
                ⚙️ Paramètres
              </a>
            </div>

            {/* Stats */}
            <div className="d-flex gap-3 mt-3 flex-wrap">
              <div className="stat-pill">
                <span className="stat-num">{Math.floor(Math.random() * 200 + 50)}</span>
                <span className="stat-label">Articles lus</span>
              </div>
              <div className="stat-pill">
                <span className="stat-num">{interestArray.length}</span>
                <span className="stat-label">Intérêts</span>
              </div>
              <div className="stat-pill">
                <span className="stat-num">{Math.floor(Math.random() * 500 + 100)}</span>
                <span className="stat-label">Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interests */}
        {interestArray.length > 0 && (
          <div className="glass-card p-4 mb-4">
            <div className="section-title mb-3">Centres d'intérêt</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {interestArray.map((interest: string, i: number) => (
                <span key={i} className="interest-tag">{interest}</span>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="glass-card p-4">
          <div className="section-title mb-3">Mon compte</div>
          <div className="d-flex flex-column gap-2">
            <a
              href="/Profile/settings"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.8rem',
                padding: '0.8rem 1rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.88rem',
                fontWeight: 500,
                border: '1.5px solid var(--border-soft)',
                transition: 'all 0.2s',
                background: 'transparent',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,92,191,0.06)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent-purple)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
            >
              <span style={{ fontSize: '1.1rem' }}>⚙️</span> Paramètres du profil
              <span style={{ marginLeft: 'auto', opacity: 0.5 }}>→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileInfo
