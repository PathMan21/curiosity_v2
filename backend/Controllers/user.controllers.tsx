import User from "../Models/User";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import UserVerifications from "../Models/UserVerifications";
import { transport } from "../Config/emailConfig";
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from "../Services/mail.services";


const createUser = async (req, res) => {
  try {
    const { username, password, email, interests } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        status: "Failed",
        message: "Cet email existe déjà" 
      });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      interests,
      verified: false,
    });

    await sendVerificationEmail({ id: newUser.get('id'), email: newUser.get('email') }, res);

  } catch (err) {
    console.error("Erreur création utilisateur:", err);
    res.status(500).json({
      status: "Failed",
      message: "Erreur lors de la création de l'utilisateur"
    });
  }
};


export { createUser };