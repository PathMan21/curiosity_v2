import { useNavigate, useLocation } from 'react-router-dom'
import Switch from '../helpers/darkmode'
import { useAuthentification } from '../Context/Auth'

function NavbarSite() {
  const { logout, user } = useAuthentification()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="navbar fixed-top navbar-expand-lg">
      <div className="container-fluid px-3">
        <a className="navbar-brand" href="/Home">
          ✦ Curiosity
        </a>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center gap-1">
            {user && (
              <span
                className="navbar-text px-2"
                style={{ color: 'var(--text-color)' }}
              >
                {user.username}
              </span>
            )}
            {user && (
              <>
                <li className="nav-item">
                  <a
                    className={`nav-link${isActive('/Home') ? ' active' : ''}`}
                    href="/Home"
                  >
                    🏠 Accueil
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link${isActive('/Profile') ? ' active' : ''}`}
                    href="/Profile"
                  >
                    👤 Profil
                  </a>
                </li>
              </>
            )}
            <li className="nav-item d-flex align-items-center px-2">
              <Switch />
            </li>
            {user ? (
              <li className="nav-item">
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-primary btn-sm"
                >
                  Déconnexion
                </button>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <a className="nav-link" href="/login">
                    Connexion
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/register">
                    Inscription
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default NavbarSite
