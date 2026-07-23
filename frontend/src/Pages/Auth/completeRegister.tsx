import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthentification } from '../../Context/Auth'
import interestsValues from '../../Assets/interests.json'

function CompleteInscription() {
  const { user } = useAuthentification()
  const [username, setUsername] = useState(user.username)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { accessToken, fetchUserProfile } = useAuthentification()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const API_URL = `${import.meta.env.VITE_SERVER_URL}`

  function handleInterests(value: string) {
    setSelectedInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!accessToken) {
      setError('Vous devez être authentifié pour continuer')
      setLoading(false)
      navigate('/login')
      return
    }

    try {
      const interests = selectedInterests
      const response = await fetch(
        `${API_URL}/api/auth/complete-inscription-oauth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: 'include',
          body: JSON.stringify({ username, password, interests }),
        }
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(
          data?.message ||
            data?.status ||
            'Erreur lors de la mise à jour du profil'
        )
      }

      const data = await response.json().catch(() => ({}))

      await fetchUserProfile()

      navigate('/Home')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main id="contenu-principal" className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body p-5">
              <h1 className="text-center mb-4">Finalisez votre inscription</h1>

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
                  <label htmlFor="complete-username" className="form-label">
                    Nom d'utilisateur <span aria-hidden="true">*</span>
                    <span className="visually-hidden">(obligatoire)</span>
                  </label>
                  <input
                    id="complete-username"
                    type="text"
                    className="form-control"
                    placeholder="Votre nom d'utilisateur"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    aria-required="true"
                    autoComplete="username"
                  />
                </div>

                <fieldset className="mb-3">
                  <legend className="form-label">Vos centres d'intérêt</legend>
                  <div className="row">
                    {interestsValues.interests.map((value, index) => {
                      const valueCleaned = value.id.split('_').join(' ')
                      return (
                        <div key={index} className="col-md-6 mb-2">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`interest-${index}`}
                              checked={selectedInterests.includes(value.id)}
                              onChange={() => handleInterests(value.id)}
                              value={value.id}
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`interest-${index}`}
                            >
                              {valueCleaned}
                            </label>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </fieldset>

                <div className="mb-3">
                  <label htmlFor="complete-password" className="form-label">
                    Mot de passe <span aria-hidden="true">*</span>
                    <span className="visually-hidden">(obligatoire)</span>
                  </label>
                  <input
                    id="complete-password"
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

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                  aria-disabled={loading}
                >
                  {loading ? 'Mise à jour…' : "Compléter l'inscription"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default CompleteInscription
