import React, { useState, useEffect } from 'react'
import { useAuth } from '../../Context/AuthContext'
import { fetchWithAuth } from '../../Services/apiClient'

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

  // ✅ RGAA 9.2 — les états de chargement/erreur restent dans le <main>
  if (loading) return (
    <main id="contenu-principal" className="container mt-4">
      {/* ✅ RGAA 7.3 — état de chargement accessible */}
      <p role="status" aria-live="polite">Chargement des favoris…</p>
    </main>
  )

  if (error) return (
    <main id="contenu-principal" className="container mt-4">
      {/* ✅ RGAA 11.3 — erreur accessible */}
      <p role="alert" aria-live="assertive" className="text-danger">{error}</p>
    </main>
  )

  if (favorites.length === 0) return (
    <main id="contenu-principal" className="container mt-4">
      <p>Vous n'avez aucun article favori pour le moment.</p>
    </main>
  )

  return (
    // ✅ RGAA 9.2 — landmark <main>
    <main id="contenu-principal" className="container mt-4">

      {/* ✅ RGAA 9.1 — h1 de page */}
      <h1 className="mb-3">Mes articles favoris</h1>

      {/* ✅ RGAA 9.3 — liste sémantique pour un ensemble d'articles */}
      <ul className="list-unstyled row" aria-label="Liste de vos articles favoris">
        {favorites.map((fav, idx) => (
          <li key={fav.id || idx} className="col-md-6 mb-3">
            <article className="card shadow-sm h-100">
              <div className="card-body">

                <h2 className="card-title h5">{fav.title}</h2>

                <p className="card-text">{fav.excerpt || fav.description}</p>

                {fav.url && (
                  <a
                    href={fav.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Lire l'article : ${fav.title} (nouvelle fenêtre)`}
                    className="btn btn-sm btn-outline-primary"
                  >
                    Lire l'article
                    <span className="visually-hidden"> (nouvelle fenêtre)</span>
                  </a>
                )}

              </div>
            </article>
          </li>
        ))}
      </ul>

    </main>
  )
}

export default ProfileFavorites
