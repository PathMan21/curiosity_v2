import React, { useState } from 'react'

function Photos({ id, title, date, url, description, photographer, photographerUrl }: any) {

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


      </div>
    </article>
  )
}

export default Photos
