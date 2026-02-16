import React, { useState, useEffect } from 'react'
import Article from './Article'
import Photos from './Photos'
// import HeaderSite from "../../Components/HeaderSite";
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
      setLoading(true)

      const response = await fetchWithAuth('/data/articles', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.articles && Array.isArray(data.articles)) {
        console.log('openalex trouvées ', data.articles)

        return data.articles
      } else {
        throw new Error('Format de réponse invalide')
      }
    } catch (err) {
      console.error('Erreur:', err)
      setError(err.message)
    } finally {
    }
  }
  const fetchImages = async () => {
    try {
      setLoading(true)

      const response = await fetchWithAuth('/data/images', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log('data : ', data)
      if (data.photos && Array.isArray(data.photos)) {
        console.log('image ressortie ', data.photos)
        return data.photos
      } else {
        throw new Error('Format de réponse invalide')
      }
    } catch (err) {
      console.error('Erreur:', err)
      setError(err.message)
    } finally {
    }
  }
  const fetchNews = async () => {
    try {
      setLoading(true)

      const response = await fetchWithAuth('/data/news', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = await response.json()

      if (data.articles && Array.isArray(data.articles)) {
        console.log('news trouvées')

        return data.articles
      } else {
        throw new Error('Format de réponse invalide')
      }
    } catch (err) {
      console.error('Erreur:', err)
      setError(err.message)
    } finally {
    }
  }

  const fetchAll = async () => {
    let shuffled = []
    const [articlesData, newsData, photosData] = await Promise.all([
      fetchArticles(),
      fetchNews(),
      fetchImages(),
    ])

    if (articlesData && newsData && photosData) {
      setLoading(false)
      shuffled = shuffleArray([...articlesData, ...newsData, ...photosData])
      console.log('data taken : ', shuffled)
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
      <NavbarSite />

      <main className="container my-5">
        <h1 className="mb-4">Articles</h1>

        {error && (
          <div className="alert alert-warning" role="alert">
            Attention: {error}. Affichage des articles par défaut.
          </div>
        )}

        {loading && (
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        )}

        <div className="row">
          <div className="col-12">
            <div className="row">
              {all.map((item, idx) => {
                switch (item.type) {
                  case 'article':
                  case 'news':
                    return (
                      <Article
                        key={`article-${idx}`}
                        id={idx}
                        title={item.title}
                        date={item.published || item.date || item.publishedAt}
                        concepts={item.concepts || item.category}
                        excerpt={
                          item.summary || item.excerpt || item.description
                        }
                        author={item.authors?.[0] || item.author || item.source}
                        type={item.type}
                        url={item.link || item.url}
                      />
                    )

                  case 'photo':
                    return (
                      <Photos
                        key={`photo-${idx}`}
                        id={idx}
                        title={item.title}
                        date={item.published}
                        url={item.url}
                        description={item.description}
                        photographer={item.photographer}
                        photographerUrl={item.photographerLink}
                      />
                    )

                  default:
                    return null
                }
              })}
            </div>
          </div>
        </div>
      </main>

      <FooterSite />
    </>
  )
}

export default ArticlePage
