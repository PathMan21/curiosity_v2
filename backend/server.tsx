import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import cookieParser from "cookie-parser";
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



;(async () => {
    await connectDB();
    app.use(cookieParser())
    app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true
    }));

    app.use('/api/user/', userRoutes);
    app.use('/api/', authRoutes);
    app.use('/api/', apiroutes);
    app.use('/api/', likesRoutes);

      const PORT = process.env.PORT
    server.listen(PORT, () => {
        console.log(`Serveur lancé sur le port ${PORT}`);
    });
})();