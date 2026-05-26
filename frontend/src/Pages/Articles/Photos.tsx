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
        <div className="photos-image-container">
          <img
            src={url}
            alt={title ? `Photo : ${title}` : 'Photo'}
            className="photos-image"
          />
        </div>
      )}

      <div className="photos-content">
        {/* Badge */}
        <span className="badge-science photos-badge">
          📷 Photo
        </span>

        {/* Title */}
        {title && (
          <h5 className="photos-title">
            {title}
          </h5>
        )}

        {/* Meta */}
        <div className="photos-meta">
          {date && <time dateTime={date}>{formatDate(date)}</time>}
          {photographer && (
            <span>
              {' · '}
              {photographerUrl ? (
                <a href={photographerUrl} target="_blank" rel="noopener noreferrer">
                  {photographer}
                </a>
              ) : photographer}
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="photos-description">
            {truncate(description)}
          </p>
        )}


      </div>
    </article>
  )
}

export default Photos
