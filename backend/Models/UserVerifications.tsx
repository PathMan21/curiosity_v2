import { DataTypes } from "sequelize";
import sequelizeDb from "../Config/dbInit";


const UserVerification = sequelizeDb.define('UserVerificationSchema', {
    userId: {
        field: "userId",
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    uniqueString: {
        field: "uniqueString",
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdAt: {
        field: "createdAt",
        type: DataTypes.DATE,
        allowNull: false
    },
    expiresAt: {
        field: "expiresAt",
        type: DataTypes.DATE,
        allowNull: false
    },
}, {
    timestamps: false 
});



export default UserVerification;

