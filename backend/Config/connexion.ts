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
  } catch (err) {
    console.error("❌ Erreur connection/sync :", err);
    throw err;
  }
};

export default connectDB;
