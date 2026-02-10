import { DataTypes, Model } from "sequelize";
import sequelizeDb from "../Config/dbInit";

interface FavoritesAttributes {
  id: number;
  articles_id: number;
  user_id: number;
}

class Favorites extends Model<FavoritesAttributes> {
  declare id: number;
  declare articles_id: number;
  declare user_id: number;
}

Favorites.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    articles_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: sequelizeDb,
    tableName: "Favorites",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "articles_id"],
      },
    ],
  }
);

export default Favorites;
