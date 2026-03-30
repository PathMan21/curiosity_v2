import { DataTypes } from 'sequelize'
import sequelizeDb from '../Config/dbInit'

const Photo = sequelizeDb.define('Photo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  unsplashId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  thumb: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  photographer: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  photographerLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  downloadLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  interest: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "photo"

  }
})

export default Photo