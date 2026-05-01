


const MAX_ARTICLE_AGE_DAYS = 30
const MAX_NEWS_AGE_DAYS = 7

const MAX_BOOK_AGE_DAYS = 50
const MAX_PHOTO_AGE_DAYS = 50

function isArticlesTooOld(articles): Boolean {

  if (!articles || articles.length === 0){
     return true
  }

  const limitDate = new Date()
  limitDate.setDate(limitDate.getDate() - MAX_ARTICLE_AGE_DAYS)

  const tooOldCount = articles.filter((article) => {
    const publishedAt = new Date(article.publishedAt)
    return publishedAt < limitDate
  }).length

  return tooOldCount > articles.length / 2
}







function isNewsTooOld(articles: any[]): boolean {
  if (!articles || articles.length === 0) return true

  const limitDate = new Date()
  limitDate.setDate(limitDate.getDate() - MAX_NEWS_AGE_DAYS)

  const tooOldCount = articles.filter((a) => {
    const publishedAt = new Date(a.publishedAt)
    return publishedAt < limitDate
  }).length

  // Si plus de la moitié des articles sont trop vieux => on le considère périmé
  return tooOldCount > articles.length / 2
}

function isBooksTooOld(books: any[]): boolean {
  if (!books || books.length === 0) return true

  const limitDate = new Date()
  limitDate.setDate(limitDate.getDate() - MAX_BOOK_AGE_DAYS)

  const tooOldCount = books.filter((b) => new Date(b.createdAt) < limitDate).length
  return tooOldCount > books.length / 2
}

function isPhotosTooOld(photos: any[]): boolean {
  if (!photos || photos.length === 0) return true

  const limitDate = new Date()
  limitDate.setDate(limitDate.getDate() - MAX_PHOTO_AGE_DAYS)

  const tooOldCount = photos.filter((p) => new Date(p.createdAt) < limitDate).length
  return tooOldCount > photos.length / 2
}



export { isArticlesTooOld, isNewsTooOld, isBooksTooOld, isPhotosTooOld }