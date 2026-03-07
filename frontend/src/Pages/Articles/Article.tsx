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
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
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
      console.log('Favori ajouté :', await response.json())
    } catch (err) { console.error('Erreur:', err) }
  }

  return (
    <article className="mb-4 articleComp" style={{
      background: '#fff',
      borderRadius: '14px',
      overflow: 'hidden',
      padding: '1.4rem 1.6rem',
      border: '1px solid rgba(212,168,71,0.18)',
    }}>
      <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {(type || concepts) && (
            <div style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {type && (
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: '#8B6914',
                  background: 'rgba(212,168,71,0.12)', padding: '0.2rem 0.6rem',
                  borderRadius: '20px',
                }}>
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

          <h5 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700, fontSize: '1.15rem',
            color: '#8B6914', marginBottom: '0.5rem', lineHeight: 1.3,
          }}>
            {title}
          </h5>

          <div style={{
            fontSize: '0.78rem', color: '#8a7a65', marginBottom: '0.75rem',
            fontFamily: "'Lato', sans-serif",
          }}>
            {formatDate(date)}{author && <span> · {author}</span>}
          </div>

          <p style={{
            fontSize: '0.9rem', color: '#4a3d2a', lineHeight: 1.65,
            marginBottom: '1rem', fontFamily: "'Lato', sans-serif",
          }}>
            {truncateExcerpt(excerpt)}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer" style={{
                fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: '#8B6914',
                textDecoration: 'none', borderBottom: '1.5px solid rgba(139,105,20,0.35)',
                paddingBottom: '1px', transition: 'border-color 0.2s',
              }}>
                Lire l'article →
              </a>
            )}
            <button
              onClick={() => likes(id)}
              title="Ajouter aux favoris"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#d4a847', fontSize: '1.1rem', padding: '0',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              ♡
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default Article
