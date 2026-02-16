import { configDotenv } from 'dotenv'
import { Sequelize } from 'sequelize'
import sequelizeDb from './dbInit.js'
import User from '../Models/User.js'
import '../Models/index.js'

const connectDB = async () => {
  try {
    await sequelizeDb.authenticate()
    await sequelizeDb.sync()
  } catch (err: any) {
    console.error('❌ Erreur connection/sync :', err?.name, err?.message)
    if (err?.stack) console.error(err.stack)
    throw err
  }
}

export default connectDB
