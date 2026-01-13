import { DataTypes, Model, Optional } from "sequelize";
import sequelizeDb from "../Config/dbInit";
import bcrypt from "bcrypt";

// 1️⃣ Interface des attributs
interface UserAttributes {
  id: number;
  username: string;
  password: string;
  email: string;
  picture?: string;
  interests?: string; // tu peux stocker JSON ou CSV
  verified: boolean;
  isTemporary: boolean;
  refreshToken?: string;
}

// 2️⃣ Attributs optionnels lors de la création
interface UserCreationAttributes extends Optional<UserAttributes, "id" | "verified" | "isTemporary" | "refreshToken"> {}

// 3️⃣ Classe Sequelize typée
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public email!: string;
  public picture?: string;
  public interests?: string;
  public verified!: boolean;
  public isTemporary!: boolean;
  public refreshToken?: string;
}

// 4️⃣ Définition du modèle
User.init(
  {
    id: {
      field: "userId",
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: true
    },
    interests: {
      type: DataTypes.STRING,
      allowNull: true
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isTemporary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  },
  {
    sequelize: sequelizeDb,
    tableName: "User",
    timestamps: false,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password && !user.password.startsWith("$2")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  }
);

export default User;
