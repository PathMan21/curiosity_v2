import FooterSite from '../../Components/FooterSite'
import NavbarSite from '../../Components/NavbarSite'
import { useAuth } from '../../Context/AuthContext'
import interestsData from '../../Assets/interests.json'
import { useState, useEffect } from 'react'
import { fetchWithAuth } from '../../Services/apiClient'

function ProfileSettings() {
  function handleInterests(value) {
    SetSelectedInterests((prev) =>
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
  const [interests, SetSelectedInterests] = useState(
    parseInterests(user?.interests)
  )
  const [picture, setPicture] = useState(user?.picture || null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (user) {
      setUsername(user.username)
      SetSelectedInterests(parseInterests(user.interests))
      setPicture(user.picture || null)
    }
  }, [user])

  const handlesubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    let btn = document.querySelector('button[type="submit"]')
    if (btn) btn.innerHTML = 'Chargement ...'

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
        setSuccess('Profil mis à jour avec succès!')
        setTimeout(() => {
          setSuccess('')
        }, 3000)
      }
    } catch (err) {
      console.error('Erreur mise à jour profil:', err)
      setError(err.message || 'Erreur lors de la mise à jour du profil')
    } finally {
      if (btn) btn.innerHTML = 'Valider les modifications'
    }
  }

  if (!user) {
    return (
      <>
        <NavbarSite />
        <div className="bg-light min-vh-100 py-5">
          <div className="container mt-4">
            <div className="row">
              <div className="col-md-8 mx-auto">
                <div className="card shadow">
                  <div className="card-body">
                    <p>Chargement du profil...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <FooterSite />
      </>
    )
  }

  return (
    <>
      <NavbarSite />

      <div className="container py-5">
        <form onSubmit={handlesubmit}>
          {/* Username */}
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Bouton pour ouvrir la modal des intérêts */}
          <button
            type="button"
            className="btn btn-primary mb-3"
            onClick={() => setShowModal(true)}
          >
            Sélectionner vos intérêts
          </button>

          {/* Submit général */}
          <button type="submit" className="btn btn-success">
            Valider
          </button>
        </form>
      </div>

      {/* Modal uniquement pour les intérêts */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Sélection des intérêts</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                {interestsData.categories.map((category) => {
                  const categoryInterests = interestsData.interests.filter(
                    (i) => i.category === category.id
                  )
                  return (
                    <div key={category.id} className="mb-3">
                      <h6 className="text-primary">{category.label}</h6>
                      <div className="row">
                        {categoryInterests.map((interest) => (
                          <div key={interest.id} className="col-6 mb-2">
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`interest-${interest.id}`}
                                checked={interests.includes(interest.id)}
                                onChange={() => handleInterests(interest.id)}
                              />
                              <label
                                htmlFor={`interest-${interest.id}`}
                                className="form-check-label"
                              >
                                {interest.label}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Fermer
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowModal(false)}
                >
                  Valider
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <FooterSite />
    </>
  )
}
export default ProfileSettings
