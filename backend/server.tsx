import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import cookieParser from "cookie-parser";
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import session from 'express-session'

import "./Helpers/configLink";
// import { register } from "prom-client";


import connectDB from './Config/connexion'
import userRoutes from './Routes/user.routes'
import authRoutes from './Routes/auth.routes'
import apiroutes from './Routes/api.routes'
import likesRoutes from './Routes/likes.routes'
import './Models/News';
import './Models/Likes';
import './Models/Book';
import './Models/Article';
import './Models/Photo';

const app = express()
const server = createServer(app)



;(async () => {
    await connectDB();
    app.use(cookieParser())
    
    app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { 
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'strict'
        }
    }))

    // client.collectDefaultMetrics({ register })

    // app.get('/metrics', async (req, res) => {
    //   res.set('Content-Type', client.register.contentType);
    //   res.end(await client.register.metrics());
    // });

    app.use(cors({
        origin: process.env.FRONTEND_URL || 'https://be-curious.fr',
        credentials: true
    }));

    app.use('/api/user/', userRoutes);
    app.use('/api/', authRoutes);
    app.use('/api/', apiroutes);
    app.use('/api/', likesRoutes);

    // PROM
    // app.get("/prom-test", function(req, res) {
    //   res.send(register.metrics());
    // });


      const PORT = process.env.PORT
   server.listen(PORT, async () => {
    console.log(`Serveur lancé sur le port ${PORT}`)
    try {
      await import('./Helpers/cron.schedules.Photos')
      await import('./Helpers/cron.schedules.Articles')
      console.log('✅ Tous les crons ont démarré avec succès')
    } catch (error) {
      console.error('❌ Erreur lors du démarrage des crons:', error)
    }
  })
})();