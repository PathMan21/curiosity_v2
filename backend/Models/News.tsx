import { Model, DataTypes, Optional } from 'sequelize'
import bcrypt from 'bcrypt'
import sequelizeDb from '../Config/dbInit'

const News = sequelizeDb.define(
  'News',
  {
    id: {
      field: 'id',
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    description: {
        field: 'description',
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: "No excerpt"

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

    }
  });