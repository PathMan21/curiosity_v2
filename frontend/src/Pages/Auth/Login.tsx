import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthentification } from '../../Context/Auth'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthentification()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/Home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="auth-logo">✦ Curiosity</div>
          <div className="auth-headline">Bon retour !</div>
          <div className="auth-subline">Connectez-vous pour explorer l'actualité</div>
        </div>

        {error && (
          <div className="alert alert-danger mb-3" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="login-email" className="form-label">Adresse e-mail</label>
            <input
              id="login-email"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="form-control"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="login-password" className="form-label">Mot de passe</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="form-control"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 mb-3"
            style={{ padding: '0.75rem', fontSize: '0.95rem' }}
          >
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" />
                Connexion…
              </span>
            ) : 'Se connecter'}
          </button>
        </form>

        <div className="text-center" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Pas encore de compte ?{' '}
          <a href="/register" style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>
            Créer un compte
          </a>
        </div>
      </div>
    </div>
  )
}

export default Login
