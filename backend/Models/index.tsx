import User from './User'
import Article from './Article'
import Book from './Book'
import News from './News'
import Photo from './Photo'
import Likes from './Likes'

// Associations
User.hasMany(Likes, { foreignKey: 'userId', as: 'likes' })
Likes.belongsTo(User, { foreignKey: 'userId', as: 'user' })

Article.hasMany(Likes, { foreignKey: 'contentId', as: 'articleLikes', scope: { contentType: 'article' } })
Likes.belongsTo(Article, { foreignKey: 'contentId', as: 'article', constraints: false })

Book.hasMany(Likes, { foreignKey: 'contentId', as: 'bookLikes', scope: { contentType: 'book' } })
Likes.belongsTo(Book, { foreignKey: 'contentId', as: 'book', constraints: false })

News.hasMany(Likes, { foreignKey: 'contentId', as: 'newsLikes', scope: { contentType: 'news' } })
Likes.belongsTo(News, { foreignKey: 'contentId', as: 'news', constraints: false })

Photo.hasMany(Likes, { foreignKey: 'contentId', as: 'photoLikes', scope: { contentType: 'photo' } })
Likes.belongsTo(Photo, { foreignKey: 'contentId', as: 'photo', constraints: false })

export { User, Article, Book, News, Photo, Likes }
