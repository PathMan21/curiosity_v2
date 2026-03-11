import React, { useState, useEffect } from 'react'
import Article from './Article'
import CarouselImg from '../../Components/Carroussels'
import Photos from './Photos'
import FooterSite from '../../Components/FooterSite'
import NavbarSite from '../../Components/NavbarSite'
import { useAuth } from '../../Context/AuthContext'
import { fetchWithAuth } from '../../Services/apiClient'

function ArticlePage(props) {
  const [articles, setArticles] = useState([])
  const [photos, setPhotos] = useState([])
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const { token } = useAuth()

  useEffect(() => {
    fetchAll()
  }, [token])

  const fetchArticles = async () => {
    try {
      const response = await fetchWithAuth('/data/articles', { method: 'GET' })
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`)
      const data = await response.json()
      if (data.articles && Array.isArray(data.articles)) return data.articles
      throw new Error('Format de réponse invalide')
    } catch (err) {
      console.error('Erreur:', err)
      setError(err.message)
    }
  }

  const fetchImages = async () => {
    try {
      const response = await fetchWithAuth('/data/images', { method: 'GET' })
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`)
      const data = await response.json()
      if (data.photos && Array.isArray(data.photos)) return data.photos
      throw new Error('Format de réponse invalide')
    } catch (err) {
      console.error('Erreur:', err)
      setError(err.message)
    }
  }

  const fetchNews = async () => {
    try {
      const response = await fetchWithAuth('/data/news', { method: 'GET' })
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`)
      const data = await response.json()
      if (data.articles && Array.isArray(data.articles)) return data.articles
      throw new Error('Format de réponse invalide')
    } catch (err) {
      console.error('Erreur:', err)
      setError(err.message)
    }
  }

  const fetchAll = async () => {
    const [articlesData, newsData, photosData] = await Promise.all([
      fetchArticles(),
      fetchNews(),
      fetchImages(),
    ])

    if (articlesData && newsData && photosData) {
      setLoading(false)
      const shuffled = shuffleArray([...articlesData, ...newsData, ...photosData])
      setAll(shuffled)
    }
  }

  function shuffleArray(data) {
    let shuffled = [...data]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, 20)
  }

  return (
    <>
      {/* ✅ RGAA 12.7 — lien d'évitement vers le contenu principal */}
      <a href="#contenu-principal" className="visually-hidden-focusable">
        Aller au contenu principal
      </a>

      <CarouselImg />

      {/* ✅ RGAA 9.2 — landmark <main> avec id */}
      <main id="contenu-principal" className="container my-5 min-vh-100 overflow-auto">

        {/* ✅ RGAA 9.1 — h1 unique et pertinent */}
        <h1 className="section-title mb-4">Vos articles</h1>

        {/* ✅ RGAA 11.3 — alerte d'erreur accessible */}
        {error && (
          <div className="alert alert-warning" role="alert" aria-live="polite">
            Attention : {error}. Affichage des articles par défaut.
          </div>
        )}

        {/* ✅ RGAA 7.3 — indicateur de chargement avec texte accessible */}
        {loading && (
          <div
            className="spinner-border"
            role="status"
            aria-label="Chargement des articles en cours"
          >
            <span className="visually-hidden">Chargement…</span>
          </div>
        )}

        <div className="container my-5 max-vh-100">
          <div className="col-12">
            {/* ✅ RGAA 9.3 — liste sémantique pour un ensemble d'articles */}
            <ul className="list-unstyled row" aria-label="Liste des articles et photos">
              {all.map((item, idx) => {
                switch (item.type) {
                  case 'article':
                  case 'news':
                    return (
                      // ✅ chaque élément de liste enveloppe le composant Article
                      <li key={`article-${idx}`} className="col-12 col-md-6">
                        <Article
                          id={idx}
                          title={item.title}
                          date={item.published || item.date || item.publishedAt}
                          concepts={item.concepts || item.category}
                          excerpt={item.summary || item.excerpt || item.description}
                          author={item.authors?.[0] || item.author || item.source}
                          type={item.type}
                          url={item.link || item.url}
                        />
                      </li>
                    )

                  case 'photo':
                    return (
                      <li key={`photo-${idx}`} className="col-12 col-md-6">
                        <Photos
                          id={idx}
                          title={item.title}
                          date={item.published}
                          url={item.url}
                          description={item.description}
                          photographer={item.photographer}
                          photographerUrl={item.photographerLink}
                        />
                      </li>
                    )

                  default:
                    return null
                }
              })}
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}

export default ArticlePage
