import { useState } from 'react'
import { useAuthentification } from '../../Context/Auth'
import interestsValues from '../../Assets/interests.json'

const API_URL = import.meta.env.VITE_SERVER_URL || ''

const handleOAuthRegister = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/google/url`, {
      method: 'GET',
    })
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
  const [selectedInterests, setSelectedInterests] = useState([])
  const [isError, setIsError] = useState('')

  const [isErrorBool, setIsErrorBool] = useState(false)

  function handleInterests(value: string) {
    setSelectedInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }
  const handleForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setIsErrorBool(false)
    setIsError('')
    try {
      const response = await fetch(`${API_URL}/api/user/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          interests: selectedInterests,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data?.message || "Erreur lors de l'inscription")
      }
      setSuccess(true)
    } catch (err) {
      setIsError(err instanceof Error ? err.message : String(err))
      setIsErrorBool(true)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card text-center">
          <div className="register-celebration"></div>
          <div className="auth-logo">Be curious</div>
          <h2 className="register-success-heading">Compte créé !</h2>
          <p className="register-success-text">
            Votre compte a bien été créé. Vous pouvez maintenant vous connecter.
          </p>
          <a href="/login" className="btn btn-primary w-100">
            Se connecter →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="auth-logo">Be curious</div>
          <div className="auth-headline">Rejoignez-nous</div>
          <div className="auth-subline">Créez votre espace de curiosité</div>
        </div>

        {isErrorBool && (
          <div
            className="alert alert-danger mb-3"
            role="alert"
            aria-live="assertive"
          >
            {isError}
          </div>
        )}

        <form onSubmit={handleForm} noValidate>
          <div className="container">
            <div className="row justify-content-around">
              <div className="col-12 col-md-6 col-lg-5">
                <div className="mb-3">
                  <label htmlFor="register-username" className="form-label">
                    Nom d'utilisateur <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="register-username"
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-7">
                <fieldset className="mb-3">
                  <legend className="form-label">Vos centres d'intérêt</legend>
                  <div className="d-flex flex-wrap gap-2">
                    <div className="row g-2">
                      {interestsValues.interests.map((value, index) => {
                        const valueCleaned = value.id.split('_').join(' ')
                        return (
                          <div key={index} className="col-6">
                            <input
                              type="checkbox"
                              className="btn-check"
                              id={`interest-${index}`}
                              checked={selectedInterests.includes(value.id)}
                              onChange={() => handleInterests(value.id)}
                              value={value.id}
                            />
                            <label
                              className="btn btn-outline-primary "
                              htmlFor={`interest-${index}`}
                            >
                              {valueCleaned}
                            </label>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
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
            ) : (
              'Créer mon compte'
            )}
          </button>
        </form>

        <div
          className="text-center"
          style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}
        >
          Déjà un compte ?{' '}
          <a
            href="/login"
            style={{ fontWeight: 600, color: 'var(--accent-purple)' }}
          >
            Se connecter
          </a>
        </div>
      </div>
    </div>
  )
}

export default Register
