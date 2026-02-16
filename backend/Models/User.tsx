import { Model, DataTypes, Optional } from 'sequelize'
import bcrypt from 'bcrypt'
import sequelizeDb from '../Config/dbInit'

const User = sequelizeDb.define(
  'User',
  {
    id: {
      field: 'userId',
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    interests: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isTemporary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'User',
    timestamps: false,
    hooks: {
      beforeCreate: async (user: any) => {
        const pwd = user.getDataValue('password')
        if (pwd && !pwd.startsWith('$2')) {
          user.setDataValue('password', await bcrypt.hash(pwd, 10))
        }
      },
      beforeUpdate: async (user: any) => {
        if (user.changed('password')) {
          const pwd = user.getDataValue('password')
          if (pwd && !pwd.startsWith('$2')) {
            user.setDataValue('password', await bcrypt.hash(pwd, 10))
          }
        }
      },
    },
  }
)

export default User
