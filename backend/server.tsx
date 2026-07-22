import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import session from 'express-session'

import './Helpers/configLink'
// import { register } from "prom-client";

import connectDB from './Config/connexion'
import userRoutes from './Routes/user.routes'
import authRoutes from './Routes/auth.routes'
import apiroutes from './Routes/api.routes'
import likesRoutes from './Routes/likes.routes'
import './Models/News'
import './Models/Likes'
import './Models/Book'
import './Models/Article'
import './Models/Photo'

const app = express()
const server = createServer(app)

app.use(cookieParser())

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
    },
  })
)

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'https://be-curious.fr',
    credentials: true,
  })
)

app.use('/api/user/', userRoutes)
app.use('/api/', authRoutes)
app.use('/api/', apiroutes)
app.use('/api/', likesRoutes)
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }))
if (process.env.NODE_ENV !== 'test') {
  ;(async () => {
    await connectDB()
    const PORT = process.env.PORT || 3000
    server.listen(PORT, async () => {
      try {
        await import('./Helpers/cron.schedules.Photos')
        await import('./Helpers/cron.schedules.Articles')
        console.log('Tous les crons ont démarré avec succès')
      } catch (error) {
        console.log('Les crons n ont pas démarrés')
      }
    })
  })()
}

export default app
