import React, { useState, useEffect } from 'react'
import { useAuth } from '../../Context/AuthContext'
import { fetchWithAuth } from '../../Services/apiClient'

import NavbarSite from '../../Components/NavbarSite'
import FooterSite from '../../Components/FooterSite'

function ProfileFavorites() {
  const { token } = useAuth()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true)
      try {
        const response = await fetchWithAuth('/favorites/getArticles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }

        const data = await response.json()
        console.log('favorites : ', data)

        setFavorites(data.favorites || [])
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Erreur lors du chargement des favoris')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchFavorites()
    }
  }, [token])

  if (loading) return <p>Chargement des favoris...</p>
  if (error) return <p className="text-danger">{error}</p>

  if (favorites.length === 0)
    return <p>Vous n’avez aucun favori pour le moment.</p>

  return (
    <>
      <NavbarSite />

      <div className="container mt-4">
        <h2 className="mb-3">Mes Favoris</h2>
        <div className="row">
          {favorites.map((fav, idx) => (
            <div key={fav.id || idx} className="col-md-6 mb-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{fav.title}</h5>
                  <p className="card-text">{fav.excerpt || fav.description}</p>
                  {fav.url && (
                    <a
                      href={fav.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      Lire l'article
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FooterSite />
    </>
  )
}

export default ProfileFavorites
