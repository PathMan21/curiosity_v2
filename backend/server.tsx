import express from 'express'
import { createServer } from 'http'
import cors from 'cors'

import options from './Config/swaggerOptions';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

import "./Helpers/configLink";

import './Helpers/cron.schedules'
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

      const env = process.env.ENVIRONNEMENT || "test";

      console.log("env => ", env);

;(async () => {
    await connectDB();

    app.use(cors({
        origin: 'http://localhost:5173',
    }));

    app.use('/api/users', userRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/data', apiroutes);
    app.use('/api/likes', likesRoutes);

    if (env == "dev") {
        console.log("environnement dev démarré");
    }

      const PORT = process.env.PORT
    server.listen(PORT, () => {
        console.log(`Serveur lancé sur le port ${PORT}`);
    });
})();