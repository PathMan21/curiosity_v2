import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import session from 'express-session'
import client from "prom-client";

import metrics from './Middlewares/metrics.middlewares'

import './Helpers/configLink'
// import { register } from "prom-client";

import connectDB from './Config/connexion'
import userRoutes from './Routes/user.routes'
import authRoutes from './Routes/auth.routes'
import apiroutes from './Routes/api.routes'
import './Models/News'
import './Models/Book'
import './Models/Article'
import './Models/Photo'

const app = express()
const server = createServer(app)

  ; (async () => {
    await connectDB()
    app.use(cookieParser())

    app.use(
      session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          sameSite: 'strict',
        },
      })
    )

    // client.collectDefaultMetrics({ register })

    // app.get('/metrics', async (req, res) => {
    //   res.set('Content-Type', client.register.contentType);
    //   res.end(await client.register.metrics());
    // });

    app.use(
      cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
      })
    )
    // test

    app.use('/api/user/', userRoutes)
    app.use('/api/', authRoutes)
    app.use('/api/', apiroutes)
    app.use(metrics);

    app.get("/metrics", async (req, res) => {
      res.setHeader(
        "Content-Type",
        client.register.contentType
      );

      res.end(await client.register.metrics());
    });


    const PORT = process.env.PORT
    server.listen(PORT, async () => {
      try {
        await import('./Helpers/cron.schedules.Photos')
        await import('./Helpers/cron.schedules.Articles')
      } catch (error) { }
    })
  })()
