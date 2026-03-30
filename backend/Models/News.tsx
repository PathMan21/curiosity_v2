import sequelizeDb from '../Config/dbInit'
import { DataTypes } from 'sequelize'

const News = sequelizeDb.define(
  'News',
  {
    id: {
      field: 'id',
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      field: 'title',
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: {
      field: 'url',
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      field: 'category',
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      field: 'description',
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "No excerpt",
    },
    publishedAt: {
      field: 'publishedAt',
      type: DataTypes.DATE,
    },
    source: {
      field: 'source',
      type: DataTypes.STRING,
      allowNull: true,
    },
    author: {
      field: 'author',
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
        field: "news",
        type: DataTypes.STRING,
        defaultValue: "news",
    }
  },
)

export default News