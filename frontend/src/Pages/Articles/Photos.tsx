import React, { useState, useEffect } from 'react'
import { useAuth } from '../../Context/AuthContext'
import { fetchWithAuth } from '../../Services/apiClient'

function Photos({ id, title, date, url, description, photographer, photographerUrl }: any) {
  const { token } = useAuth()
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    checkLikeStatus()
  }, [id])

  const checkLikeStatus = async () => {
    try {
      const response = await fetchWithAuth(`/likes/status?contentId=${id}&contentType=photo`)
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
      }
    } catch (error) {
      console.error('Error checking like status:', error)
    }
  }

  const toggleLikes = async () => {
    try {
      const response = await fetchWithAuth('/likes/toggle', {
        method: 'POST',
        body: JSON.stringify({ contentId: id, contentType: 'photo' }),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la mise à jour')
      }

      const data = await response.json()
      setIsLiked(data.liked)
      console.log(data)
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }
  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    } catch { return dateStr }
  }

  const truncateText = (text: string, maxLength: number = 200) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '…' : text
  }

  const formattedDate = formatDate(date)

  return (
    <article
      className="mb-4 articleComp"
      style={{
        background: '#fff',
        borderRadius: '14px',
        overflow: 'hidden',
        border: '1px solid rgba(212,168,71,0.18)',
      }}
    >
      {url && (
        <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
          <img
            src={url}
            alt={title ? `Photo : ${title}` : 'Photo astronomique'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <div style={{ padding: '1.2rem 1.4rem' }}>
        <div style={{
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: '#8B6914',
          marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem',
        }}>
          <span aria-hidden="true">✦</span> Photo
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 700, fontSize: '1.05rem',
          color: '#8B6914', marginBottom: '0.4rem',
        }}>
          {title}
        </h2>

        <div style={{ fontSize: '0.78rem', color: '#8a7a65', marginBottom: '0.6rem' }}>
          {date && <time dateTime={date}>{formattedDate}</time>}
          {photographer && (
            <>
              {' · '}
              {photographerUrl ? (
                <a
                  href={photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Voir le profil du photographe ${photographer} (nouvelle fenêtre)`}
                  style={{ color: '#8a7a65' }}
                >
                  {photographer}
                  <span className="visually-hidden"> (nouvelle fenêtre)</span>
                </a>
              ) : (
                <span>{photographer}</span>
              )}
            </>
          )}
        </div>

        <p style={{ fontSize: '0.87rem', color: '#4a3d2a', lineHeight: 1.6, marginBottom: '0.8rem' }}>
          {truncateText(description)}
        </p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Voir la photo en taille réelle : ${title} (nouvelle fenêtre)`}
              style={{
                fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: '#8B6914', textDecoration: 'none',
                borderBottom: '1.5px solid rgba(139,105,20,0.35)', paddingBottom: '1px',
              }}
            >
              Voir la photo
              <span className="visually-hidden"> (nouvelle fenêtre)</span>
            </a>
          )}
          <button
            className={`likes ${isLiked ? 'liked' : ''}`}
            onClick={toggleLikes}
            aria-label={isLiked ? `Retirer "${title}" des favoris` : `Ajouter "${title}" aux favoris`}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              color: isLiked ? '#8B6914' : '#ccc',
            }}
          >
            <span aria-hidden="true">
              {isLiked ? '♥' : '♡'}
            </span>
          </button>
        </div>
      </div>
    </article>
  )
}

export default Photos
