import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./Config/connexion";
import "./Models/index";
import { json } from "sequelize";
import { createServer } from "http";
import userRoutes from "./Routes/user.routes";
import authRoutes from "./Routes/auth.routes";
import apiroutes from "./Routes/api.routes";

import cors from "cors";

dotenv.config({
  // Charger le .env depuis le dossier Config local (chemin correct pour le Dockerfile qui copie le dossier dans /app)
  path: path.resolve(process.cwd(), "Config/.env"),
});
const app = express();
const server = createServer(app);
const PORT = process.env.PORT;

// accepter les cors :

app.use(
    cors({
      origin: "http://localhost:5173"
    })
  );


(async () => {


  await connectDB();

  app.use(cors({ origin: "http://localhost:5173" }));
  app.use("/api/users", userRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/data", apiroutes);

  app.get("/api/ping", (req, res: Response) => {
    res.send("Pong");
  });

  server.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur le port ${PORT}`);
  });
})();