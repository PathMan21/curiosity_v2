import { configDotenv } from 'dotenv'
import { Sequelize } from 'sequelize'
import sequelizeDb from './dbInit'
import User from '../Models/User.tsx'

const connectDB = async () => {
  try {
    await sequelizeDb.authenticate()
    await sequelizeDb.sync({ alter: true })
  } catch (err) {
    console.error('❌ Erreur connection/sync :', err)
    throw err
  }
}

export default connectDB
