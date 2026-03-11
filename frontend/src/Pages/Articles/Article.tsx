import React from 'react'
import { useAuth } from '../../Context/AuthContext'
import { useSearchParams } from 'react-router-dom'

function Article({ id, title, date, excerpt, author, type, url, concepts }: any) {
  const { token, fetchUserProfile } = useAuth()
  const [searchParams] = useSearchParams()

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    } catch { return dateStr }
  }

  const truncateExcerpt = (text: string, maxLength: number = 220) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '…' : text
  }

  const likes = async (articles_id: string | number) => {
    const activeToken = searchParams.get('token') || token || localStorage.getItem('authToken')
    try {
      const response = await fetch('http://localhost:3000/api/favorites/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ articles_id }),
      })
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`)
    } catch (err) { console.error('Erreur:', err) }
  }

  const formattedDate = formatDate(date)

  return (
    <article
      className="mb-4 articleComp"
      style={{ borderRadius: '14px', overflow: 'hidden', padding: '1.4rem 1.6rem' }}
    >
      <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>

          {(type || concepts) && (
            <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {type && (
                <span
                  style={{
                    fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.08em', color: '#8B6914',
                    background: 'rgba(212,168,71,0.12)', padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                  }}
                >
                  {type}
                </span>
              )}
              {concepts && (
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: '#8a7a65',
                  background: 'rgba(138,122,101,0.08)', padding: '0.2rem 0.6rem',
                  borderRadius: '20px',
                }}>
                  {concepts}
                </span>
              )}
            </div>
          )}

          <h2 style={{
            fontFamily: "'Tahoma', Georgia, serif",
            fontWeight: 550, fontSize: '1.15rem',
            marginBottom: '0.5rem', lineHeight: 1.3,
          }}>
            {title}
          </h2>

          <div style={{
            fontSize: '0.78rem', marginBottom: '0.75rem',
            fontFamily: "'Tahoma', sans-serif",
          }}>
            {date && <time dateTime={date}>{formattedDate}</time>}
            {author && <span> · <span>{author}</span></span>}
          </div>

          <p className="paragraph" style={{
            fontSize: '1rem', lineHeight: 1.65,
            marginBottom: '1rem', fontFamily: "'Tahoma', sans-serif",
          }}>
            {truncateExcerpt(excerpt)}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {url && (
              // ✅ RGAA 6.1 — intitulé explicite avec titre de l'article
              // ✅ RGAA 6.3 — nouvelle fenêtre indiquée
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Lire l'article : ${title} (nouvelle fenêtre)`}
                className='lire_larticle'
              >
                Lire l'article
                {/* ✅ RGAA 6.3 — indication "nouvelle fenêtre" accessible */}
                <span className="visually-hidden"> (nouvelle fenêtre)</span>
              </a>
            )}

            {/* ✅ RGAA 7.1 / 11.9 — bouton avec aria-label explicite */}
            {/* ✅ RGAA 1.1 — le caractère ♡ n'est pas porteur d'info suffisante seul */}
            <button
              onClick={() => likes(id)}
              aria-label={`Ajouter "${title}" aux favoris`}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#d4a847', fontSize: '1.1rem', padding: '0',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {/* ✅ aria-hidden sur l'icône décorative */}
              <span aria-hidden="true">♡</span>
            </button>
          </div>

        </div>
      </div>
    </article>
  )
}

export default Article
