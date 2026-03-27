import express, { Request, Response } from 'express'
import dotenv from 'dotenv'
import path from 'path'
import connectDB from './Config/connexion'
import { json } from 'sequelize'
import { createServer } from 'http'
import userRoutes from './Routes/user.routes'
import authRoutes from './Routes/auth.routes'
import apiroutes from './Routes/api.routes'
import cors from 'cors'

import './Helpers/cron.schedules';
dotenv.config({
  path: path.resolve(process.cwd(), 'Config/.env'),
})
const app = express()
const server = createServer(app)
const PORT = process.env.PORT


app.use(
  cors({
    origin: 'http://localhost:5173',
  })
)

;(async () => {
  await connectDB()

  app.use(cors({ origin: 'http://localhost:5173' }))
  app.use('/api/users', userRoutes)
  app.use('/api/auth', authRoutes)
  app.use('/api/data', apiroutes)

 
  server.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur le port ${PORT}`)
  })
})()
