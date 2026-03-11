import { useAuth } from '../Context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Switch from "../helpers/darkmode"

function NavbarSite() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <nav className="navbar fixed-top navbar-expand-lg" style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid rgba(212,168,71,0.25)',
        boxShadow: '0 2px 16px rgba(139,105,20,0.08)',
        padding: '0.9rem 2rem',
      }}>
        <div className="container-fluid">
          <a className="navbar-brand" href="/" style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '1.55rem',
            fontWeight: 700,
            color: '#8B6914',
            letterSpacing: '0.01em',
          }}>
            ✦ Dashboard
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
            style={{ borderColor: 'rgba(139,105,20,0.3)' }}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center gap-2">
              <li className="nav-item">
                <a
                  className="nav-link"
                  href="/Profile"
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#8a7a65',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#8B6914')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#8a7a65')}
                >
                  Profil
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center' }}>
                <Switch />
              </li>
              <li className="nav-item">
                <button
                  onClick={handleLogout}
                  style={{
                    fontFamily: "'Lato', sans-serif",
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#fff',
                    background: '#8B6914',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.45rem 1.1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#6b5010')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#8B6914')}
                >
                  Déconnexion
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  )
}

export default NavbarSite
