import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../Context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }
return (
  <div className="container mt-5">
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow">
          <div className="card-body p-5">

            <h1 className="text-center mb-4">Connexion</h1>

            <p className="text-center mb-4 link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover">
              Pas encore de compte ?{" "}
              <a
                className="link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover"
                href="/register"
              >
                S'inscrire
              </a>
            </p>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="mb-3">
                <label className="form-label">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Mot de passe
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="form-control"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-100 mb-3"
              >
                {loading ? "Connexion en cours…" : "Se connecter"}
              </button>

            </form>

          </div>
        </div>
      </div>
    </div>
  </div>
)
}

export default Login;