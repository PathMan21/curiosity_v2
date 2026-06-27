const MAX_ARTICLE_AGE_DAYS = 30
const MAX_PHOTO_AGE_DAYS = 90
function isArticlesTooOld(articles: any[] | null | undefined): boolean {
  if (!articles || !Array.isArray(articles) || articles.length === 0) {
    return true
  }
  const first = articles[0]
  if (!first) return true
  const dateStr = first.published || first.publishedAt
  if (!dateStr) return true
  
  const publishedAt = new Date(dateStr)
  if (isNaN(publishedAt.getTime())) {
    return true
  }
  const limitDate = new Date()
  limitDate.setDate(limitDate.getDate() - MAX_ARTICLE_AGE_DAYS)
  return publishedAt < limitDate
}
function isPhotosTooOld(photos: any[] | null | undefined): boolean {
  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    return true
  }
  const first = photos[0]
  if (!first) return true
  const dateStr = first.createdAt || first.published
  if (!dateStr) return true
  
  const createdAt = new Date(dateStr)
  if (isNaN(createdAt.getTime())) {
    return true
  }
  const limitDate = new Date()
  limitDate.setDate(limitDate.getDate() - MAX_PHOTO_AGE_DAYS)
  return createdAt < limitDate
}
export { isArticlesTooOld, isPhotosTooOld }