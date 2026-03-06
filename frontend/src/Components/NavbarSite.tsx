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
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            Dashboard
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a
                  className="nav-link active"
                  aria-current="page"
                  href="/Profile"
                >
                  Profile 🐭
                </a>
              </li>
              <li><Switch></Switch></li>
              <li className="nav-item">
                <button
                  className="nav-link active"
                  aria-current="page"
                  onClick={handleLogout}
                >
                  Logout ❌
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
