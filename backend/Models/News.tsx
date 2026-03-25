import { Model, DataTypes, Optional } from 'sequelize'
import bcrypt from 'bcrypt'
import sequelizeDb from '../Config/dbInit'

const Likes = sequelizeDb.define(
  'Likes',
  {
    id: {
      field: 'id',
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
        field: 'userId',
        type: DataTypes.INTEGER,

    },
    contentId: {
        field: 'contentId',
        type: DataTypes.INTEGER,
        
    },
    contentType: {
        field: 'contentType',
        type: DataTypes.STRING 
    }
  });