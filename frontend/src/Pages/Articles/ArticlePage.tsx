import React, { useEffect, useState } from 'react'

import Article from './Article'
import Photos from './Photos'

import CarouselImg from '../../Components/Carroussels'
import FooterSite from '../../Components/FooterSite'
import NavbarSite from '../../Components/NavbarSite'

import { useAuthentification } from '../../Context/Auth'

import { privateApi } from '../../Context/Interceptor'

function ArticlePage() {

  const [all, setAll] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState('')

  const { isLogged } = useAuthentification()

  useEffect(() => {

    if (!isLogged) return

    fetchArticles()

  }, [isLogged])

  const fetchArticles = async () => {

    try {

      setLoading(true)

      const response = await privateApi.get('/articles')

      const articles = response.data.articles

      if (!Array.isArray(articles)) {
        throw new Error('Format de réponse invalide')
      }

      const shuffled = shuffleArray(articles, 20)

      setAll(shuffled)

    } catch (err) {

      let status = err.response.status;
      let msg = err.response.data.message;
      console.error(status, msg)

      setError(`${status} : ${msg}` || 'Erreur inconnue')

    } finally {

      setLoading(false)

    }
  }

  const shuffleArray = (data, amount) => {

    const shuffled = [...data]

    for (let i = shuffled.length - 1; i > 0; i--) {

      const j = Math.floor(Math.random() * (i + 1))

      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return shuffled.slice(0, amount)
  }

  return (
    <>

      <CarouselImg />

      <main
        id="contenu-principal"
        className="container my-5 min-vh-100 overflow-auto"
      >

        <h1 className="section-title mb-4">
          Vos articles
        </h1>

        {error && (
          <div
            className="alert alert-warning"
            role="alert"
          >
            {error}
          </div>
        )}

        {loading && (
          <div
            className="spinner-border"
            role="status"
          >
            <span className="visually-hidden">
              Chargement...
            </span>
          </div>
        )}

        <ul className="list-unstyled row">

          {all.map((item, idx) => {


            if (
              item.type === 'article' ||
              item.type === 'news'
            ) {

              return (
                <li
                  key={`article-${idx}`}
                  className="col-12 col-md-12"
                >
                  <Article
                    id={item.id}
                    title={item.title}
                    topic={item.topic}
                    date={
                      item.published ||
                      item.date ||
                      item.publishedAt
                    }
                    concepts={
                      item.concepts ||
                      item.category
                    }
                    excerpt={
                      item.summary ||
                      item.excerpt ||
                      item.description
                    }
                    author={
                      item.authors?.[0] ||
                      item.author ||
                      item.source
                    }
                    type={item.type}
                    url={item.link || item.url}
                  />
                </li>
              )
            }

            if (item.type === 'photo') {

              return (
                <li
                  key={`photo-${idx}`}
                  className="col-12 col-md-6"
                >
                  <Photos
                    id={item.id}
                    title={item.title}
                    date={item.published}
                    url={item.url}
                    description={item.description}
                    photographer={item.photographer}
                    photographerUrl={item.photographerLink}
                  />
                </li>
              )
            }

            return null
          })}
        </ul>

      </main>

    </>
  )
}

export default ArticlePage