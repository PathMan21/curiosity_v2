import React from 'react'
import { useAuth } from '../../Context/AuthContext'
import { useSearchParams } from 'react-router-dom'

function Article({
  id,
  title,
  date,
  excerpt,
  author,
  type,
  url,
  concepts,
}: any) {
  const { token, fetchUserProfile } = useAuth()
  const [searchParams] = useSearchParams()

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const truncateExcerpt = (text: string, maxLength: number = 300) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const likes = async (articles_id: string | number) => {
    const activeToken =
      searchParams.get('token') || token || localStorage.getItem('authToken')

    try {
      const response = await fetch(
        'http://localhost:3000/api/favorites/articles',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeToken}`,
          },
          body: JSON.stringify({
            articles_id,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      console.log('Favori ajouté :', await response.json())
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  return (
    <article className="mb-4 p-4 border rounded-2 articleComp bg-light-subtle">
      <div className="row align-items-start">
        <div className="col-md-10">
          <h5 className="mb-2">
            <strong>{title}</strong>
          </h5>
          <div className="mb-2 text-muted small">
            <span>{formatDate(date)}</span>
            {author && <span> • {author}</span>}
            {type && <span> • {type}</span>}
            {concepts && <span> • {concepts}</span>}
          </div>

          <p className="mb-3">{truncateExcerpt(excerpt)}</p>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline-primary"
            >
              Lire l'article
            </a>
          )}
        </div>
      </div>

      <button className="btn btn-primary" onClick={() => likes(id)}>
        Ajouter aux favoris
      </button>
    </article>
  )
}

export default Article
