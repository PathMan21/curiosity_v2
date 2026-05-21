import React, { useEffect, useMemo, useState } from 'react'

import FeedPost from '../../Components/FeedPost'
import Photos from './Photos'

import { useAuthentification } from '../../Context/Auth'
import { privateApi } from '../../Context/Interceptor'

const topics = ['Tout', 'Science', 'Tech', 'Nature', 'Art', 'Histoire']

type FeedItem =
  | {
      id: string
      type: 'article'
      title: string
      topic?: string
      description?: string
      author?: string
      date?: string
      url?: string
    }
  | {
      id: string
      type: 'photo'
      title?: string
      image: string
      description?: string
      author?: string
      date?: string
    }

function ArticlePage() {
  const { isLogged, user } = useAuthentification()

  const [items, setItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTopic, setActiveTopic] = useState('Tout')

  useEffect(() => {
    if (!isLogged) return
    fetchFeed()
  }, [isLogged])

  /**
   * FETCH GLOBAL FEED
   */
  const fetchFeed = async () => {
    try {
      setLoading(true)
      setError('')

      const [articlesRes, photosRes] = await Promise.all([
        privateApi.get('/articles/'),
        privateApi.get('/photos/')
      ])

      const articles = articlesRes.data.articles
      const photos = photosRes.data.photos

      if (!Array.isArray(articles) || !Array.isArray(photos)) {
        throw new Error('Format de réponse invalide')
      }

      const normalizedArticles: FeedItem[] = articles.map((a: any) => ({
        id: a.id,
        type: 'article',
        title: a.title,
        topic: a.topic,
        description: a.summary || a.excerpt || a.description,
        author: a.authors?.[0] || a.author || a.source,
        date: a.published || a.date || a.publishedAt,
        url: a.link || a.url
      }))

      const normalizedPhotos: FeedItem[] = photos.map((p: any) => ({
        id: p.id,
        type: 'photo',
        title: p.title,
        image: p.url,
        description: p.description,
        author: p.photographer,
        date: p.published
      }))

      const merged = shuffleArray([
        ...normalizedArticles,
        ...normalizedPhotos
      ], 20)

      setItems(merged)

    } catch (err: any) {
      const status = err?.response?.status
      const msg = err?.response?.data?.message

      setError(`${status ?? ''} : ${msg ?? err.message ?? 'Erreur inconnue'}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * SHUFFLE
   */
  const shuffleArray = (data: FeedItem[], amount: number) => {
    const arr = [...data]

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }

    return arr.slice(0, amount)
  }

  /**
   * FILTER
   */
  const filtered = useMemo(() => {
    if (activeTopic === 'Tout') return items

    return items.filter(item => {
      if (item.type !== 'article') return false
      return item.topic?.toLowerCase() === activeTopic.toLowerCase()
    })
  }, [items, activeTopic])

  /**
   * GREETING
   */
  const greeting = () => {
    const h = new Date().getHours()
    if (h < 6) return 'Bonne nuit'
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  /**
   * RENDER ITEM
   */
  const renderItem = (item: FeedItem, idx: number) => {
    if (item.type === 'article') {
      return (
        <FeedPost
          key={`article-${item.id}-${idx}`}
          id={item.id}
          title={item.title}
          topic={item.topic}
          date={item.date}
          excerpt={item.description}
          author={item.author}
          url={item.url}
        />
      )
    }

    if (item.type === 'photo') {
      return (
        <Photos
          key={`photo-${item.id}-${idx}`}
          id={item.id}
          title={item.title}
          url={item.image}
          description={item.description}
          photographer={item.author}
          photographerUrl={undefined}
        />
      )
    }

    return null
  }

  return (
    <div className="page-with-nav" style={{ minHeight: '100vh' }}>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* HEADER */}
        <div
          className="glass-card p-4 mb-4"
          style={{
            background:
              'linear-gradient(135deg, rgba(124,92,191,0.08) 0%, rgba(232,121,160,0.06) 100%)'
          }}
        >
          <div className="d-flex align-items-center gap-3">

            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'var(--gradient-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                color: 'white',
                fontWeight: 700,
                flexShrink: 0
              }}
            >
              {user?.username ? user.username[0].toUpperCase() : '✦'}
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {greeting()}
              </div>

              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {user?.username || 'Curieux'} !
              </div>
            </div>

            <div className="ms-auto" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Score
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                {Math.floor(Math.random() * 900 + 100)}
              </div>
            </div>

          </div>
        </div>

        {/* TOPICS */}
        <div className="feed-tabs mb-3 flex-wrap">
          {topics.map(t => (
            <button
              key={t}
              className={`feed-tab ${activeTopic === t ? 'active' : ''}`}
              onClick={() => setActiveTopic(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="section-title mb-3">
          Vos articles
        </div>

        {/* ERROR */}
        {error && (
          <div className="alert alert-warning">
            {error}
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="d-flex flex-column align-items-center py-5 gap-3">

            <div className="spinner-border" role="status" />

            <span style={{ color: 'var(--text-muted)' }}>
              Chargement du fil…
            </span>

          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

            {filtered.length === 0 && !error && (
              <div className="glass-card p-4 text-center">
                Aucun contenu pour ce thème.
              </div>
            )}

            {filtered.map(renderItem)}

          </div>
        )}

      </div>
    </div>
  )
}

export default ArticlePage