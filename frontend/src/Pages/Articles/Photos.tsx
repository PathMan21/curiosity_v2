import React, { useState } from 'react'

function Photos({ id, title, date, url, description, photographer, photographerUrl }: any) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(() => Math.floor(Math.random() * 80) + 5)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    } catch { return dateStr }
  }

  const truncate = (text: string, max: number = 200) =>
    !text ? '' : text.length > max ? text.substring(0, max) + '…' : text

  return (
    <article className="feed-post p-0 overflow-hidden">
      {/* Image */}
      {url && (
        <div style={{ width: '100%', height: '220px', overflow: 'hidden', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
          <img
            src={url}
            alt={title ? `Photo : ${title}` : 'Photo'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        </div>
      )}

      <div style={{ padding: '1.1rem 1.3rem' }}>
        {/* Badge */}
        <span className="badge-science" style={{ marginBottom: '0.6rem', display: 'inline-flex' }}>
          📷 Photo
        </span>

        {/* Title */}
        {title && (
          <h5 style={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.35, marginBottom: '0.3rem' }}>
            {title}
          </h5>
        )}

        {/* Meta */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
          {date && <time dateTime={date}>{formatDate(date)}</time>}
          {photographer && (
            <span>
              {' · '}
              {photographerUrl ? (
                <a href={photographerUrl} target="_blank" rel="noopener noreferrer"
                  style={{ color: 'var(--accent-purple)' }}>
                  {photographer}
                </a>
              ) : photographer}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.8rem' }}>
            {truncate(description)}
          </p>
        )}

        {/* Actions */}
        <div className="d-flex align-items-center gap-2">
          <button
            onClick={() => { setLiked(!liked); setLikes(prev => liked ? prev - 1 : prev + 1) }}
            style={{
              background: liked ? 'rgba(232,121,160,0.1)' : 'none',
              border: 'none', cursor: 'pointer',
              fontSize: '0.8rem', color: liked ? 'var(--accent-pink)' : 'var(--text-muted)',
              padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)',
              fontFamily: 'var(--font-ui)', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              transition: 'all 0.2s',
            }}
          >
            {liked ? '♥' : '♡'} {likes}
          </button>

          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginLeft: 'auto',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--accent-purple)',
                padding: '0.25rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid rgba(124,92,191,0.25)',
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,92,191,0.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
            >
              Voir la photo →
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default Photos
