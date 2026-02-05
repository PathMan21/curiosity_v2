import User from "../Models/User";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import UserVerifications from "../Models/UserVerifications";
import { transport } from "../Config/emailConfig";
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from "../Services/mail.services";
import jwt from "jsonwebtoken";


const generateTokens = (userId: number) => {

  const accessToken = jwt.sign(
    { userId },
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

const updatedProfile = async (req, res) => {
  try {
    const { username, email, interests, picture } = req.body;
    const userId = req.user.userId; 

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ status: "Failed", message: "Utilisateur non trouvé" });
    }

    const updateData: any = {};
    if (typeof username !== 'undefined') updateData.username = username;
    if (typeof email !== 'undefined') updateData.email = email;
    if (typeof picture !== 'undefined') updateData.picture = picture;
    if (typeof interests !== 'undefined') updateData.interests = JSON.stringify(interests);

    // Appliquer l'update
    await user.update(updateData);


    const { accessToken, refreshToken } = generateTokens(user.dataValues.id);
    await user.update({ refreshToken });

    let returnedInterests: any = [];
    try {
      returnedInterests = user.dataValues.interests ? JSON.parse(user.dataValues.interests) : [];
    } catch (e) {
      returnedInterests = [];
    }

    res.json({
      status: "Success",
      message: "Profil mis à jour avec succès",
      accessToken,
      refreshToken,
      user: {
        id: user.dataValues.id,
        email: user.dataValues.email,
        username: user.dataValues.username,
        verified: user.dataValues.verified,
        interests: returnedInterests,
        picture: user.dataValues.picture
      }
    });

  } catch (err) {
    console.error("Erreur d'update utilisateur :", err);
    res.status(500).json({ status: "Failed", message: "Erreur lors de la mise à jour du profil" });
  }
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

    let createdId: number | null;
    createdId = newUser.get?.('id') ?? newUser.id ?? newUser.get?.('userId') ?? null;

    if (!createdId) {
      console.error("createUser: id utilisateur manquant pour l'enregistrement:", newUser.toJSON());
      return res.status(500).json({
        status: "Failed",
        message: "Erreur interne: impossible de récupérer l'ID de l'utilisateur"
      });
    }

    await sendVerificationEmail({ id: createdId, email: newUser.get('email') }, res);

    const { accessToken, refreshToken } = generateTokens(createdId);

    await newUser.update({ refreshToken });

    res.cookie("jwt", accessToken, { 
      httpOnly: true, 
      secure: true,
      sameSite: 'strict'
    });

    return res.status(201).json({
      status: "Success",
      message: "Utilisateur créé avec succès",
      accessToken,
      refreshToken
    });

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

    const passwordMatch = await bcrypt.compare(password, user.dataValues.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        status: "Failed",
        message: "Email ou mot de passe incorrect" 
      });
    }

    // Créer un JWT minimal
    const { accessToken, refreshToken } = generateTokens(user.dataValues.id);

    // Stocker le refresh token en base de données
    await user.update({ refreshToken });

    res.json({
      status: "Success",
      accessToken,
      refreshToken,
      user: {
        id: user.dataValues.id,
        email: user.dataValues.email,
        username: user.dataValues.username,
        verified: user.dataValues.verified,
        interests: user.dataValues.interests,
        picture: user.dataValues.picture
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

    if (!user || user.dataValues.refreshToken !== refreshToken) {
      return res.status(401).json({
        status: "Failed",
        message: "Refresh token invalide"
      });
    }
    
    // Générer un nouveau access token minimal
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.dataValues.id);

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

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'verified', 'interests', 'picture', 'isTemporary']
    });

    if (!user) {
      return res.status(404).json({
        status: "Failed",
        message: "Utilisateur non trouvé"
      });
    }
    const plainUser = user.get({ plain: true });

    res.json({
      status: "Success",
      user: plainUser
    });

  } catch (err) {
    console.error("Erreur récupération profil:", err);
    res.status(500).json({
      status: "Failed",
      message: "Erreur lors de la récupération du profil"
    });
  }
};

export { createUser, loginUser, refreshTokenHandler, updatedProfile, getCurrentUser};