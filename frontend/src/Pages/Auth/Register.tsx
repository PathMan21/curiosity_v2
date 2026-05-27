import { useState } from 'react'
import { useAuthentification } from '../../Context/Auth';

const API_URL = `${import.meta.env.VITE_SERVER_URL}`;

const handleOAuthRegister = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/google/url`, { method: 'GET' })
    const data = await response.json()
    window.location.href = data.url
  } catch (err) {
    console.error('Erreur:', err)
  }
}

function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const [isError, setIsError] = useState('');

  const [isErrorBool, setIsErrorBool] = useState(false);
  const handleForm = async (e: React.FormEvent) => {
    
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/user/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || 'Erreur lors de l\'inscription');
      }
      setSuccess(true)
    } catch (err) {
      setIsError(err)
      setIsErrorBool(true)
      console.error('Erreur inscription:', err)
    } finally {
      setIsErrorBool(false)
      setIsError('')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card text-center">
          <div className="register-celebration">🎉</div>
          <div className="auth-logo">✦ Curiosity</div>
          <h2 className="register-success-heading">Compte créé !</h2>
          <p className="register-success-text">
            Votre compte a bien été créé. Vous pouvez maintenant vous connecter.
          </p>
          <a href="/login" className="btn btn-primary w-100">Se connecter →</a>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="auth-logo">✦ Curiosity</div>
          <div className="auth-headline">Rejoignez-nous</div>
          <div className="auth-subline">Créez votre espace de curiosité</div>
        </div>

        {isErrorBool && (
          <div className="alert alert-danger mb-3" role="alert" aria-live="assertive">
            {isError}
          </div>
        )}

        <form onSubmit={handleForm} noValidate>
          <div className="mb-3">
            <label htmlFor="register-username" className="form-label">
              Nom d'utilisateur <span aria-hidden="true">*</span>
            </label>
            <input
              id="register-username"
              type="text"
              className="form-control"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="votre_pseudo"
              required
              autoComplete="username"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="register-email" className="form-label">
              Adresse e-mail <span aria-hidden="true">*</span>
            </label>
            <input
              id="register-email"
              type="email"
              className="form-control"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="register-password" className="form-label">
              Mot de passe <span aria-hidden="true">*</span>
            </label>
            <input
              id="register-password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 mb-3 login-submit-btn"
          >
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" />
                Inscription…
              </span>
            ) : "Créer mon compte"}
          </button>

          <div className="register-divider-container">
            <div className="register-divider-line" />
            <span className="register-divider-text">ou</span>
            <div className="register-divider-line" />
          </div>

          <button
            type="button"
            className="btn btn-outline-primary w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
            onClick={handleOAuthRegister}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2045C17.64 8.5663 17.5827 7.9527 17.4764 7.3636H9V10.845H13.8436C13.635 11.97 13.0009 12.9231 12.0477 13.5613V15.8195H14.9564C16.6582 14.2527 17.64 11.9454 17.64 9.2045Z" fill="#4285F4"/>
              <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
              <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.5931 3.68182 9C3.68182 8.4069 3.78409 7.83 3.96409 7.29V4.9582H0.957275C0.347727 6.1731 0 7.5477 0 9C0 10.4523 0.347727 11.8269 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
              <path d="M9 3.5796C10.3214 3.5796 11.5077 4.0336 12.4405 4.9259L15.0218 2.3445C13.4632 0.8918 11.4259 0 9 0C5.48182 0 2.43818 2.0168 0.957275 4.9582L3.96409 7.29C4.67182 5.1627 6.65591 3.5796 9 3.5796Z" fill="#EA4335"/>
            </svg>
            Continuer avec Google
          </button>
        </form>

        <div className="text-center" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Déjà un compte ?{' '}
          <a href="/login" style={{ fontWeight: 600, color: 'var(--accent-purple)' }}>
            Se connecter
          </a>
        </div>
      </div>
    </div>
  )
}

export default Register
