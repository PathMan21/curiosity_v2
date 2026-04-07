import React from 'react'
import { useAuth } from '../../Context/AuthContext'
import { useSearchParams } from 'react-router-dom'
import { fetchWithAuth } from '../../Services/apiClient'

function Article({ id, title, date, excerpt, author, type, url, concepts }: any) {
  const { token, fetchUserProfile } = useAuth()
  const [searchParams] = useSearchParams()

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    } catch { return dateStr }
  }

  const truncateExcerpt = (text) => {
    let maxLength = 200;
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '…' : text
  }

  async function addLikes( id, type ){

        const response = await fetchWithAuth('/likes/add', {
        method: 'POST',
        body: JSON.stringify({ contentId: id, contentType: type }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erreur lors de la mise à jour')
      }

      let data = await response.json();
      console.log(data);

  }


  const formattedDate = formatDate(date)

  return (
    <article
      className="mb-4 articleComp"
    >
      <div className='d-flex mx-auto'>
        <div className="mb-1">

            <div className='mb-1 d-flex flex-wrap'>
                <span className='articleText'
                >
               { type ? type : concepts }
               </span>
            </div>

          <h2 className='card-title'>
            {title}
          </h2>

          <div>
            {date && <time dateTime={date}>{formattedDate}</time>}
            {author && <span> · <span>{author}</span></span>}
          </div>

          <p className="paragraph" >
            {truncateExcerpt(excerpt)}
          </p>

          <div className='d-flex justify-content-between'>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Lire l'article : ${title} (nouvelle fenêtre)`}
                className='lire_larticle'
              >
                Lire l'article
                <span className="visually-hidden"> (nouvelle fenêtre)</span>
              </a>
            )}
            <button className='likes'
              onClick={() => addLikes( id, title )}
              aria-label={`Ajouter "${title}" aux favoris`}
            >

              <span aria-hidden="true">
♡


              </span>
            </button>
          </div>

        </div>
      </div>
    </article>
  )
}

export default Article
