import React, { useEffect, useState } from 'react'
import FeedPost from '../../Components/FeedPost'
import Photos from './Photos'
import { useAuthentification } from '../../Context/Auth'
import { privateApi } from '../../Context/Interceptor'

const topics = ['Tout', 'Science', 'Tech', 'Nature', 'Art', 'Histoire']

function ArticlePage() {
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTopic, setActiveTopic] = useState('Tout')
  const { isLogged, user } = useAuthentification()

  useEffect(() => {
    if (!isLogged) return
    fetchArticles()
  }, [isLogged])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const response = await privateApi.get('/articles')
      const articles = response.data.articles
      if (!Array.isArray(articles)) throw new Error('Format de réponse invalide')
      const shuffled = shuffleArray(articles, 20)
      setAll(shuffled)
    } catch (err: any) {
      const status = err?.response?.status
      const msg = err?.response?.data?.message
      setError(`${status ?? ''} : ${msg ?? 'Erreur inconnue'}`)
    } finally {
      setLoading(false)
    }
  }

  const shuffleArray = (data: any[], amount: number) => {
    const shuffled = [...data]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, amount)
  }

  const filtered = activeTopic === 'Tout'
    ? all
    : all.filter((item: any) => item.topic?.toLowerCase() === activeTopic.toLowerCase())

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 6) return 'Bonne nuit'
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  return (
    <div className="page-with-nav" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1.5rem 1rem' }}>

        {/* Greeting banner */}
        <div className="glass-card p-4 mb-4" style={{ background: 'linear-gradient(135deg, rgba(124,92,191,0.08) 0%, rgba(232,121,160,0.06) 100%)' }}>
          <div className="d-flex align-items-center gap-3">
            <div style={{
              width: 52, height: 52,
              borderRadius: '50%',
              background: 'var(--gradient-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', color: 'white', fontWeight: 700,
              fontFamily: 'var(--font-ui)',
              flexShrink: 0
            }}>
              {user?.username ? user.username[0].toUpperCase() : '✦'}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontWeight: 500 }}>
                {greeting()} 👋
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                {user?.username || 'Curieux'} !
              </div>
            </div>
            <div className="ms-auto" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>Score</div>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-purple)' }}>
                {Math.floor(Math.random() * 900 + 100)}
              </div>
            </div>
          </div>
        </div>

        {/* Topic filter tabs */}
        <div className="feed-tabs mb-3 flex-wrap" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
          {topics.map(t => (
            <button
              key={t}
              className={`feed-tab${activeTopic === t ? ' active' : ''}`}
              onClick={() => setActiveTopic(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Section title */}
        <div className="section-title mb-3">Vos articles</div>

        {/* Error */}
        {error && (
          <div className="alert alert-warning" role="alert">{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="d-flex flex-column align-items-center py-5 gap-3">
            <div className="spinner-border" role="status" style={{ width: '2.5rem', height: '2.5rem' }}>
              <span className="visually-hidden">Chargement…</span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'var(--font-ui)' }}>
              Chargement du fil…
            </span>
          </div>
        )}

        {/* Feed */}
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filtered.length === 0 && !error && (
              <div className="glass-card p-4 text-center" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
                Aucun article pour ce thème pour l'instant.
              </div>
            )}
            {filtered.map((item: any, idx: number) => {
              if (item.type === 'article' || item.type === 'news') {
                return (
                  <FeedPost
                    key={`article-${idx}`}
                    id={item.id}
                    title={item.title}
                    topic={item.topic}
                    date={item.published || item.date || item.publishedAt}
                    excerpt={item.summary || item.excerpt || item.description}
                    author={item.authors?.[0] || item.author || item.source}
                    url={item.link || item.url}
                  />
                )
              }
              if (item.type === 'photo') {
                return (
                  <Photos
                    key={`photo-${idx}`}
                    id={item.id}
                    title={item.title}
                    date={item.published}
                    url={item.url}
                    description={item.description}
                    photographer={item.photographer}
                    photographerUrl={item.photographerLink}
                  />
                )
              }
              return null
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArticlePage
