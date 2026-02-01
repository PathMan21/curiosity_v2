import nodemailer from "nodemailer";
import UserVerification from "../Models/UserVerifications";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { transport } from "../Config/emailConfig";



const validateByMail = (req, res, next) => {

    transport.verify((err, success) => {
        if (err) {
            console.log(err);
            return res.status(405).json({ message: "N'a pas réussis a envoyer le mail" });
        } else {
            console.log("success : " + success);

            next();
        }
    });
};

export default validateByMail;
