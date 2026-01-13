import User from "../Models/User";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import UserVerifications from "../Models/UserVerifications";
import { transport } from "../Config/emailConfig";
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from "../Services/mail.services";
import jwt from "jsonwebtoken";

// Fonction utilitaire pour générer les tokens
const generateTokens = (userId: number, username: string,  email: string, interests?: string, picture?: string, verified?: boolean) => {
  const accessToken = jwt.sign(
    { userId, username, interests, email, picture, verified },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};


const createUser = async (req, res) => {
  try {
    const { username, password, email, interests } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (user) {
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
    console.log(newUser);
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
    const { accessToken, refreshToken } = generateTokens(
      user.id,
      user.username,
      user.email,
      user.interests,
      user.picture,
      user.verified
    );

    // Stocker le refresh token en base de données
    await user.update({ refreshToken });

    res.json({
      status: "Success",
      accessToken,
      refreshToken,
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

const refreshTokenHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        status: "Failed",
        message: "Refresh token manquant"
      });
    }

    // Vérifier le refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET) as any;

    // Vérifier que le token existe en base de données
    const user = await User.findByPk(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        status: "Failed",
        message: "Refresh token invalide"
      });
    }

    // Générer un nouveau access token
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id,
      user.username,
      user.interests,
      user.email,
      user.picture,
      user.verified,
    );

    // Mettre à jour le refresh token en base
    await user.update({ refreshToken: newRefreshToken });

    res.json({
      status: "Success",
      accessToken,
      refreshToken: newRefreshToken
    });

  } catch (err) {
    console.error("Erreur refresh token:", err);
    res.status(401).json({
      status: "Failed",
      message: "Refresh token invalide ou expiré"
    });
  }
};

export { createUser, loginUser, refreshTokenHandler };