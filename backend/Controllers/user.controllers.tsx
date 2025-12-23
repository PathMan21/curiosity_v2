import User from "../Models/User";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import UserVerifications from "../Models/UserVerifications";
import { transport } from "../Config/emailConfig";
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from "../Services/mail.services";
import jwt from "jsonwebtoken";


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


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        status: "Failed",
        message: "Email et mot de passe requis" 
      });
    }

    const user = await User.findOne({ where: { email } }) as User | null;
    
    if (!user) {
      return res.status(401).json({ 
        status: "Failed",
        message: "Email ou mot de passe incorrect" 
      });
    }

    // Vérifier le mot de passe (hachés via bcrypt)
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        status: "Failed",
        message: "Email ou mot de passe incorrect" 
      });
    }

    // Créer un JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      status: "Success",
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        verified: user.verified
      }
    });

  } catch (err) {
    console.error("Erreur login utilisateur:", err);
    res.status(500).json({
      status: "Failed",
      message: "Erreur lors de la connexion"
    });
  }
};


export { createUser, loginUser };