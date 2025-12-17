import { configDotenv } from "dotenv";
import path from "path";
import { Sequelize } from "sequelize";

configDotenv({ path: path.resolve(process.cwd(), "backend/Config/.env") });

const sequelizeDb = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    dialect: "mariadb",
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      freezeTableName: true,
    },
  }
);


console.log("sequelize database : " + process.env.DB_NAME);

export default sequelizeDb;
