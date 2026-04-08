import React, { useState, useEffect } from 'react'
import Article from './Article'
import CarouselImg from '../../Components/Carroussels'
import Photos from './Photos'
import FooterSite from '../../Components/FooterSite'
import NavbarSite from '../../Components/NavbarSite'
import { useAuth } from '../../Context/AuthContext'
import { fetchWithAuth } from '../../Services/apiClient'
import CarouselBooks from '../../Components/CarousselsBooks'

function ArticlePage(props) {
  const [articles, setArticles] = useState([])
  const [photos, setPhotos] = useState([])
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [books, setBooks] = useState([])



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

  const fetchBooks = async () => {
    try {
      const response = await fetchWithAuth('/data/books', { method: 'GET' })
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`)
      const data = await response.json()
      return data.data
    } catch (err) {
      console.error('Erreur books:', err)
      setError(err.message)
    }
  }
  const fetchImages = async () => {
    try {
      const response = await fetchWithAuth('/data/images', { method: 'GET' })
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`)
      const data = await response.json()
      return data.photos
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
      return data.articles
    } catch (err) {
      console.error('Erreur:', err)
      setError(err.message)
    }
  }



  const fetchAll = async () => {
    const [articlesData, newsData, imageData, booksData] = await Promise.all([
      fetchArticles(),
      fetchNews(),
      fetchImages(),
      fetchBooks(),
    ])

    if (newsData && booksData && imageData && articlesData) {
      setLoading(false)
      const shuffledBooks = shuffleArray(booksData, 5);
      setBooks(shuffledBooks);
      const shuffled = shuffleArray([ ...newsData, ...articlesData, ...imageData], 20)
      setAll(shuffled)
    }
  }

  function shuffleArray(data, amount) {
    let shuffled = [...data]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, amount)
  }

  return (
    <>
      <NavbarSite></NavbarSite>
      <CarouselImg />

      <a href="#contenu-principal" className="visually-hidden-focusable">
        Aller au contenu principal
      </a>


      <main id="contenu-principal" className="container my-5 min-vh-100 overflow-auto">

        <h1 className="section-title mb-4">Vos articles</h1>

        {error && (
          <div className="alert alert-warning" role="alert" aria-live="polite">
            Attention : {error}. Affichage des articles par défaut.
          </div>
        )}

        {loading && (
          <div
            className="spinner-border"
            role="status"
            aria-label="Chargement des articles en cours"
          >
            <span className="visually-hidden">Chargement…</span>
          </div>
        )}
        <div className="d-flex flex-row-reverse w-100">
          {/* <div className="btn-group btn-group-toggle" data-toggle="buttons">
            <label className="btn btn-secondary active rounded">
              <input type="radio" name="options" id="option1" checked/> Pour vous
            </label>
            <label className="btn btn-secondary rounded">
              <input type="radio" name="options" id="option2"/> Les plus appréciés
            </label>
          </div> */}
        </div>
        <div className="container my-5 max-vh-100">
          <div className="col-12">
            <CarouselBooks books={books} />

            <ul className="list-unstyled row" aria-label="Liste des articles et photos">
              {all.map((item, idx) => {
                switch (item.type) {
                  case 'article':
                  case 'news':
                    return (
                      <li key={`article-${idx}`} className="col-12 col-md-6">
                        
                        <Article
                          id={item.id}
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
                          id={item.id}
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
      <FooterSite></FooterSite>

    </>
  )
}

export default ArticlePage
