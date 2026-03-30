import { DataTypes } from 'sequelize'
import sequelizeDb from '../Config/dbInit'

const Article = sequelizeDb.define('Article', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  openAlexId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  authors: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  published: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  summary: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  doi: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pdfUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isOpenAccess: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  publicationYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "article"
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mainTopic: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  topicScore: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  concepts: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subfield: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})

export default Article