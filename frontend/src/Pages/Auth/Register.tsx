import { useState } from 'react'

const handleOAuthRegister = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/google/url', {
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
  // ✅ RGAA 11.3 — état d'erreur et succès pour retour utilisateur
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.message || "Erreur lors de l'inscription")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    // ✅ RGAA 9.2 — landmark <main>
    <main id="contenu-principal" className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body p-5">

              {/* ✅ RGAA 9.1 — h1 présent */}
              <h1 className="text-center mb-4">Inscription</h1>

              <p className="text-center mb-4">
                {/* ✅ RGAA 6.1 — intitulé de lien explicite */}
                <a href="/login">Déjà un compte ? Se connecter</a>
              </p>

              {/* ✅ RGAA 11.3 — zone d'erreur accessible */}
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

              <form onSubmit={handleForm} noValidate>

                <div className="mb-3">
                  {/* ✅ RGAA 11.1 — labels associés via htmlFor / id */}
                  <label htmlFor="register-username" className="form-label">
                    Nom d'utilisateur{' '}
                    <span aria-hidden="true">*</span>
                    <span className="visually-hidden">(obligatoire)</span>
                  </label>
                  <input
                    id="register-username"
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Votre nom d'utilisateur"
                    required
                    aria-required="true"
                    // ✅ RGAA 11.13 — autocomplete
                    autoComplete="username"
                  />
                  {/* ✅ RGAA 11.1 — aide contextuelle traduite en français */}
                  <small className="form-text text-muted">
                    Ce champ est obligatoire.
                  </small>
                </div>

                <div className="mb-3">
                  <label htmlFor="register-email" className="form-label">
                    Adresse e-mail{' '}
                    <span aria-hidden="true">*</span>
                    <span className="visually-hidden">(obligatoire)</span>
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    className="form-control"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    aria-required="true"
                    autoComplete="email"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="register-password" className="form-label">
                    Mot de passe{' '}
                    <span aria-hidden="true">*</span>
                    <span className="visually-hidden">(obligatoire)</span>
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    aria-required="true"
                    autoComplete="new-password"
                  />
                </div>

                {/* ✅ RGAA 7.1 — aria-disabled reflète l'état */}
                <button
                  type="submit"
                  disabled={loading}
                  aria-disabled={loading}
                  className="btn btn-primary w-100 mb-3"
                >
                  {loading ? 'Inscription en cours…' : "S'inscrire"}
                </button>

              </form>

              {/* ✅ RGAA 6.1 — intitulé de bouton explicite */}
              <button
                className="btn btn-outline-primary w-100"
                onClick={handleOAuthRegister}
                aria-label="S'inscrire avec Google"
              >
                S'inscrire avec Google
              </button>

            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Register
