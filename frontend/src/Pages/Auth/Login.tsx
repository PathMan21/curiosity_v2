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
    // ✅ RGAA 9.2 — landmark <main> avec id pour lien d'évitement
    <main id="contenu-principal" className="container mt-5">

      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body p-5">

              {/* ✅ RGAA 9.1 — h1 présent et cohérent */}
              <h1 className="text-center mb-4">Connexion</h1>

              <p className="text-center mb-4">
                Pas encore de compte ?{' '}
                {/* ✅ RGAA 6.1 — intitulé de lien explicite (pas "cliquez ici") */}
                <a href="/register">Créer un compte</a>
              </p>

              {/* ✅ RGAA 11.3 — erreur avec role="alert" + aria-live="assertive" */}
              {error && (
                <div
                  className="alert alert-danger"
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>

                <div className="mb-3">
                  {/* ✅ RGAA 11.1 — label lié au champ via htmlFor / id */}
                  <label htmlFor="login-email" className="form-label">
                    Adresse e-mail{' '}
                    <span aria-hidden="true">*</span>
                    <span className="visually-hidden">(obligatoire)</span>
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    aria-required="true"
                    // ✅ RGAA 11.13 — autocomplete pour aide à la saisie
                    autoComplete="email"
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="login-password" className="form-label">
                    Mot de passe{' '}
                    <span aria-hidden="true">*</span>
                    <span className="visually-hidden">(obligatoire)</span>
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    aria-required="true"
                    autoComplete="current-password"
                    className="form-control"
                  />
                </div>

                {/* ✅ RGAA 7.1 — aria-disabled reflète l'état désactivé */}
                <button
                  type="submit"
                  disabled={loading}
                  aria-disabled={loading}
                  className="btn btn-primary w-100 mb-3"
                >
                  {loading ? 'Connexion en cours…' : 'Se connecter'}
                </button>

              </form>

            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Login
