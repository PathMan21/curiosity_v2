import { configDotenv } from 'dotenv'
import { Sequelize } from 'sequelize'
import sequelizeDb from './dbInit'

const connectDB = async () => {
  try {
    await sequelizeDb.authenticate()
    await sequelizeDb.sync()
  } catch (err) {
    console.error('Erreur connection/sync :', err)
    throw err
  }
}

export default connectDB
