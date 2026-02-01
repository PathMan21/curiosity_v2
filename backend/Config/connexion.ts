import { configDotenv } from "dotenv";
import { Sequelize } from "sequelize";
import sequelizeDb from "./dbInit.js";
import User from "../Models/User.js";
import "../Models/index.js";

const connectDB = async () => {
  try {
    await sequelizeDb.authenticate();
    console.log("✅ Sequelize & mariadb fonctionnel");
    
    await sequelizeDb.sync();
    console.log("✅ Sequelize a synchronisé les tables");
  } catch (err: any) {
    // Affiche le nom, le message et la stack pour faciliter le debug
    console.error("❌ Erreur connection/sync :", err?.name, err?.message);
    if (err?.stack) console.error(err.stack);
    throw err;
  }
};

export default connectDB;
