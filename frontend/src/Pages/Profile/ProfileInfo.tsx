function ProfileInfo(props) {
  let interestArray
  if (props.interests) {
    try { interestArray = JSON.parse(props.interests) } catch { interestArray = [] }
  }

  return (
    <div style={{ padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <div style={{
          background: '#fff',
          borderRadius: '18px',
          boxShadow: '0 4px 24px rgba(139,105,20,0.10)',
          border: '1px solid rgba(212,168,71,0.2)',
          overflow: 'hidden',
        }}>
          {/* Header doré */}
          <div style={{
            background: 'linear-gradient(135deg, #8B6914 0%, #c49a28 100%)',
            height: '80px',
          }} />

          <div style={{ padding: '0 2rem 2rem', textAlign: 'center' }}>
            {/* Avatar */}
            <div style={{ marginTop: '-45px', marginBottom: '1rem' }}>
              {props.img ? (
                <img
                  src={props.img}
                  alt="profil"
                  referrerPolicy="no-referrer"
                  style={{
                    width: '90px', height: '90px',
                    borderRadius: '50%', objectFit: 'cover',
                    border: '4px solid #fff',
                    boxShadow: '0 4px 16px rgba(139,105,20,0.2)',
                  }}
                />
              ) : (
                <div style={{
                  width: '90px', height: '90px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d4a847, #8B6914)',
                  border: '4px solid #fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', color: '#fff',
                  boxShadow: '0 4px 16px rgba(139,105,20,0.2)',
                }}>
                  {props.username ? props.username[0].toUpperCase() : '?'}
                </div>
              )}
            </div>

            <h3 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700, fontSize: '1.5rem',
              color: '#8B6914', margin: '0 0 0.3rem',
            }}>
              {props.username}
            </h3>
            <p style={{ fontSize: '0.87rem', color: '#8a7a65', marginBottom: '1rem' }}>
              {props.email}
            </p>

            {interestArray && interestArray.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                {interestArray.map((interest: string, i: number) => (
                  <span key={i} style={{
                    fontSize: '0.75rem', fontWeight: 600,
                    color: '#8B6914', background: 'rgba(212,168,71,0.12)',
                    border: '1px solid rgba(212,168,71,0.3)',
                    borderRadius: '20px', padding: '0.25rem 0.75rem',
                  }}>
                    {interest}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <a href="/Profile/settings" style={{
                padding: '0.55rem 1.3rem',
                border: '1.5px solid #8B6914', borderRadius: '9px',
                color: '#8B6914', fontWeight: 700, fontSize: '0.82rem',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                textDecoration: 'none', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#8B6914'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8B6914' }}
              >
                Paramètres
              </a>
              <a href="/Profile/Favorites" style={{
                padding: '0.55rem 1.3rem',
                background: '#8B6914', borderRadius: '9px',
                color: '#fff', fontWeight: 700, fontSize: '0.82rem',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                textDecoration: 'none', border: '1.5px solid transparent',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#6b5010')}
              onMouseLeave={e => (e.currentTarget.style.background = '#8B6914')}
              >
                ♡ Favoris
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileInfo
