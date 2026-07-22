import React, { useEffect, useMemo, useState } from 'react'

import FeedPost from '../../Components/FeedPost'
import Photos from './Photos'

import { useAuthentification } from '../../Context/Auth'
import { privateApi } from '../../Context/Interceptor'


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
   * Va chercher le fil d'actualité global   */
  const fetchFeed = async () => {
    try {
      setLoading(true)
      setError('')

      const [articlesRes, photosRes] = await Promise.all([
        privateApi.get('/articles/'),
        privateApi.get('/photos/'),
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
        url: a.link || a.url,
      }))

      const normalizedPhotos: FeedItem[] = photos.map((p: any) => ({
        id: p.id,
        type: 'photo',
        title: p.title,
        image: p.url,
        description: p.description,
        author: p.photographer,
        date: p.published,
      }))

      const merged = shuffleArray(
        [...normalizedArticles, ...normalizedPhotos],
        20
      )

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

    return items.filter((item) => {
      if (!item.type) return false
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
    <div className="page-with-nav article-page-container">
      <div className="article-page-content">
        {/* HEADER */}
        <div className="glass-card p-4 mb-4 article-header-card">
          <div className="d-flex align-items-center gap-3">
            <div className="article-user-avatar">
              {user?.username ? user.username[0].toUpperCase() : '✦'}
            </div>

            <div>
              <div className="article-greeting-text">{greeting()}</div>

              <div className="article-username-text">
                {user?.username || 'Curieux'} !
              </div>
            </div>
          </div>
        </div>

        <div className="section-title mb-3">Vos articles</div>

        {/* ERROR */}
        {error && <div className="alert alert-warning">{error}</div>}

        {/* LOADING */}
        {loading ? (
          <div className="d-flex flex-column align-items-center py-5 gap-3">
            <div className="spinner-border" role="status" />

            <span className="article-loading-text">Chargement du fil…</span>
          </div>
        ) : (
          <div className="article-items-container">
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
