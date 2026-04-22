import React, { useState, useEffect } from 'react'
import { useAuth } from '../../Context/AuthContext'
import { fetchWithAuth } from '../../Services/apiClient'
import Article from '../Articles/Article'
import Photos from '../Articles/Photos'
import FooterSite from '../../Components/FooterSite'
import NavbarSite from '../../Components/NavbarSite'

function ProfileFavorites() {
  const { token } = useAuth()
  const [favorites, setFavorites] = useState<{
    articles: any[],
    news: any[],
    photos: any[],
    books: any[]
  }>({
    articles: [],
    news: [],
    photos: [],
    books: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true)
      try {
        const likesResponse = await fetchWithAuth('/likes/user')
        if (!likesResponse.ok) {
          throw new Error(`Erreur HTTP: ${likesResponse.status}`)
        }
        const likesData = await likesResponse.json()

        const articleIds = likesData.likes.article || []
        const newsIds = likesData.likes.news || []
        const photoIds = likesData.likes.photo || []
        const bookIds = likesData.likes.book || []

        const [articlesData, newsData, photosData, booksData] = await Promise.all([
          fetchContentDetails(articleIds, 'articles'),
          fetchContentDetails(newsIds, 'news'),
          fetchContentDetails(photoIds, 'images'),
          fetchContentDetails(bookIds, 'books')
        ])

        setFavorites({
          articles: articlesData,
          news: newsData,
          photos: photosData,
          books: booksData
        })

      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Erreur lors du chargement des favoris')
      } finally {
        setLoading(false)
      }
    }

    const fetchContentDetails = async (ids: number[], endpoint: string) => {
      if (ids.length === 0) return []

      try {
        const response = await fetchWithAuth(`/data/${endpoint}`)
        if (!response.ok) return []

        const data = await response.json()
        const contentArray = data.articles || data.photos || data.data || []

        return contentArray.filter((item: any) => ids.includes(item.id))
      } catch (error) {
        console.error(`Erreur lors de la récupération des ${endpoint}:`, error)
        return []
      }
    }

    if (token) {
      fetchFavorites()
    }
  }, [token])

  const hasFavorites = Object.values(favorites).some(arr => arr.length > 0)

  if (loading) return (
    <main id="contenu-principal" className="container mt-4">
      <p role="status" aria-live="polite">Chargement de vos favoris…</p>
    </main>
  )

  if (error) return (
    <main id="contenu-principal" className="container mt-4">
      <p role="alert" aria-live="assertive" className="text-danger">{error}</p>
    </main>
  )

  if (!hasFavorites) return (
    <main id="contenu-principal" className="container mt-4">
      <h1 className="mb-3">Mes favoris</h1>
      <p>Vous n'avez aucun contenu favori pour le moment.</p>
    </main>
  )

  return (
    <>
    <NavbarSite></NavbarSite>
    <main id="contenu-principal" className="container mt-4">

      <h1 className="mb-4">Mes favoris</h1>

      {favorites.articles.length > 0 && (
        <section className="mb-5">
          <h2 className="h4 mb-3">Articles favoris</h2>
          <ul className="list-unstyled row" aria-label="Liste de vos articles favoris">
            {favorites.articles.map((article, idx) => (
              <li key={`article-${article.id || idx}`} className="col-12 col-md-6 mb-3">
                <Article
                  id={article.id}
                  title={article.title}
                  date={article.published || article.date || article.publishedAt}
                  concepts={article.concepts || article.category}
                  excerpt={article.summary || article.excerpt || article.description}
                  author={article.authors?.[0] || article.author || article.source}
                  type="article"
                  url={article.link || article.url}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {favorites.news.length > 0 && (
        <section className="mb-5">
          <h2 className="h4 mb-3">Articles d'actualité favoris</h2>
          <ul className="list-unstyled row" aria-label="Liste de vos articles d'actualité favoris">
            {favorites.news.map((news, idx) => (
              <li key={`news-${news.id || idx}`} className="col-12 col-md-6 mb-3">
                <Article
                  id={news.id}
                  title={news.title}
                  date={news.published || news.date || news.publishedAt}
                  concepts={news.concepts || news.category}
                  excerpt={news.summary || news.excerpt || news.description}
                  author={news.authors?.[0] || news.author || news.source}
                  type="news"
                  url={news.link || news.url}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {favorites.photos.length > 0 && (
        <section className="mb-5">
          <h2 className="h4 mb-3">Photos favorites</h2>
          <ul className="list-unstyled row" aria-label="Liste de vos photos favorites">
            {favorites.photos.map((photo, idx) => (
              <li key={`photo-${photo.id || idx}`} className="col-12 col-md-6 mb-3">
                <Photos
                  id={photo.id}
                  title={photo.title}
                  date={photo.published}
                  url={photo.url}
                  description={photo.description}
                  photographer={photo.photographer}
                  photographerUrl={photo.photographerLink}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {favorites.books.length > 0 && (
        <section className="mb-5">
          <h2 className="h4 mb-3">Livres favoris</h2>
          <div className="row">
            {favorites.books.map((book, idx) => (
              <div key={`book-${book.id || idx}`} className="col-12 col-md-6 col-lg-4 mb-3">
                <div className="card h-100 shadow-sm">
                  {book.cover && (
                    <img
                      src={book.cover}
                      alt={`Couverture de ${book.title}`}
                      className="card-img-top"
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <div className="card-body d-flex flex-column">
                    <h3 className="card-title h6">{book.title}</h3>
                    {book.author && (
                      <p className="card-text text-muted small">Par {book.author}</p>
                    )}
                    {book.description && (
                      <p className="card-text small flex-grow-1">
                        {book.description.length > 150
                          ? `${book.description.substring(0, 150)}…`
                          : book.description}
                      </p>
                    )}
                    {book.url && (
                      <a
                        href={book.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary mt-auto"
                        aria-label={`Voir le livre : ${book.title} (nouvelle fenêtre)`}
                      >
                        Voir le livre
                        <span className="visually-hidden"> (nouvelle fenêtre)</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    <FooterSite></FooterSite>

    </main>

    </>
  )
}

export default ProfileFavorites
