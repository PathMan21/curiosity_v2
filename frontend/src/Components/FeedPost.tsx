import React, { useState } from 'react'

type FeedPostProps = {
  id?: any
  title?: string
  excerpt?: string
  author?: string
  date?: string
  topic?: string
  url?: string
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
    if (diff < 60) return "à l'instant"
    if (diff < 3600) return `${Math.floor(diff / 60)}min`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  } catch {
    return dateStr
  }
}

const topicColors: Record<string, string> = {
  science: 'rgba(79,142,247,0.12)',
  tech: 'rgba(124,92,191,0.12)',
  nature: 'rgba(93,200,176,0.12)',
  art: 'rgba(232,121,160,0.12)',
  histoire: 'rgba(244,162,97,0.12)',
}

export default function FeedPost({
  id,
  title,
  excerpt,
  author,
  date,
  topic,
  url,
}: FeedPostProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(() => Math.floor(Math.random() * 120) + 3)
  const [bookmarked, setBookmarked] = useState(false)

  const toggleLike = () => {
    setLiked(!liked)
    setLikes((prev) => (liked ? prev - 1 : prev + 1))
  }

  const topicKey = topic?.toLowerCase() || ''
  const topicBg = topicColors[topicKey] || 'rgba(124,92,191,0.10)'

  return (
    <article className="feed-post">
      <div className="d-flex gap-3">
        {/* Avatar */}
        <div className="avatar-ring flex-shrink-0">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(author || 'A')}&background=7c5cbf&color=fff&bold=true`}
            alt={author}
          />
        </div>

        <div className="flex-fill min-w-0">
          {/* Header */}
          <div className="d-flex align-items-start justify-content-between gap-2 mb-1">
            <div>
              <span className="feed-post-author">
                {author || 'Auteur inconnu'}
              </span>
              <span className="feed-post-username">
                @{(author || 'user').toLowerCase().replace(/\s+/g, '')}
              </span>
              <span className="feed-post-date">· {formatDate(date)}</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              {topic && (
                <span className="badge-science" style={{ background: topicBg }}>
                  {topic}
                </span>
              )}
              <button
                onClick={() => setBookmarked(!bookmarked)}
                className={`feed-post-bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
                aria-label="Sauvegarder"
              >
                {bookmarked ? '🔖' : '🏷'}
              </button>
            </div>
          </div>

          {/* Title */}
          {title && <h5 className="feed-post-title">{title}</h5>}

          {/* Excerpt */}
          {excerpt && <p className="feed-post-excerpt">{excerpt}</p>}

          {/* Actions */}
          <div className="d-flex align-items-center gap-2 mt-2">
            {/* <button
              onClick={toggleLike}
              className={`feed-post-like-btn ${liked ? 'liked' : ''}`}
              aria-pressed={liked}
              aria-label="Aimer"
            >
              {liked ? '♥' : '♡'} <span>{likes}</span>
            </button> */}

            <a
              href={url || '#'}
              target="_blank"
              rel="noreferrer"
              className="feed-post-read-link"
              aria-label="Lire l'article"
            >
              Lire →
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
