import { DataTypes } from 'sequelize'
import sequelizeDb from '../Config/dbInit'

const Book = sequelizeDb.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  subject: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cover: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cacheKey: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "book"

  }
})

export default Book