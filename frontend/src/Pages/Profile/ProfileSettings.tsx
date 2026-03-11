import FooterSite from '../../Components/FooterSite'
import NavbarSite from '../../Components/NavbarSite'
import { useAuth } from '../../Context/AuthContext'
import interestsData from '../../Assets/interests.json'
import { useState, useEffect, useRef } from 'react'
import { fetchWithAuth } from '../../Services/apiClient'
import ProfileAccessibility from './ProfileAccessibility'

function ProfileSettings() {
  function handleInterests(value: string) {
    setSelectedInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  const { user, updateProfile, fetchUserProfile } = useAuth()

  const parseInterests = (interests: string | undefined): string[] => {
    if (!interests) return []
    try {
      return typeof interests === 'string' ? JSON.parse(interests) : interests
    } catch {
      return []
    }
  }

  const [username, setUsername] = useState(user?.username || '')
  const [interests, setSelectedInterests] = useState(parseInterests(user?.interests))
  const [picture, setPicture] = useState(user?.picture || null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // ✅ RGAA 11.3 — ref pour gérer le focus sur la zone de statut
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      setUsername(user.username)
      setSelectedInterests(parseInterests(user.interests))
      setPicture(user.picture || null)
    }
  }, [user])

  const handlesubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetchWithAuth('/users/updated-profile', {
        method: 'POST',
        body: JSON.stringify({ username, interests, picture }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la mise à jour')
      }

      const data = await response.json()

      if (data.status === 'Success') {
        updateProfile(data.accessToken, data.refreshToken)
        await fetchUserProfile()
        // ✅ RGAA 11.3 — message de succès annoncé via aria-live
        setSuccess('Profil mis à jour avec succès !')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err: any) {
      console.error('Erreur mise à jour profil:', err)
      setError(err.message || 'Erreur lors de la mise à jour du profil')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="bg-light min-vh-100 py-5">
        <div className="container mt-4">
          <div className="row">
            <div className="col-md-8 mx-auto">
              <div className="card shadow">
                <div className="card-body">
                  {/* ✅ RGAA 7.3 — indicateur de chargement accessible */}
                  <p role="status" aria-live="polite">Chargement du profil…</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <main id="contenu-principal" className="container py-5">

      <h1 className="mb-4">Paramètres du profil</h1>

      <div
        ref={statusRef}
        aria-live="polite"
        aria-atomic="true"
        className={`alert ${error ? 'alert-danger' : 'alert-success'} ${!error && !success ? 'd-none' : ''}`}
        role={error ? 'alert' : 'status'}
      >
        {error || success}
      </div>

      <ProfileAccessibility />

      <form onSubmit={handlesubmit} noValidate>

        <div className="mb-3">
          {/* ✅ RGAA 11.1 — label associé via htmlFor / id */}
          <label htmlFor="settings-username" className="form-label">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            id="settings-username"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

        {/* ✅ RGAA 11.5 — fieldset + legend pour les cases à cocher groupées */}
        <fieldset className="mb-3">
          <legend className="form-label">Sélectionnez vos centres d'intérêt</legend>
          {interestsData?.interests.map((item) => (
            <div key={item.id} className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id={`interest-${item.id}`}
                checked={interests.includes(item.id)}
                onChange={() => handleInterests(item.id)}
              />
              {/* ✅ RGAA 11.1 — chaque checkbox a son label associé */}
              <label htmlFor={`interest-${item.id}`} className="form-check-label">
                {item.label}
              </label>
            </div>
          ))}
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          aria-disabled={loading}
          className="btn btn-success"
        >
          {loading ? 'Sauvegarde en cours…' : 'Valider'}
        </button>

      </form>
    </main>
  )
}

export default ProfileSettings
