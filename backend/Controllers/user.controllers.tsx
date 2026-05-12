import User from '../Models/User'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import { sendVerificationEmail } from '../Services/mail.services'
import jwt from 'jsonwebtoken'

import "../Helpers/configLink";
const generateTokens = (userId: number) => {

    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    })
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
    })




  return { accessToken, refreshToken }
}

const updatedProfile = async (req, res) => {
  try {
    const { username, email, interests, picture } = req.body
    const userId = req.user.userId

    const user = await User.findByPk(userId)
    if (!user) {
      return res
        .status(404)
        .json({ status: 'Failed', message: 'Utilisateur non trouvé' })
    }

    const updateData: any = {}
    if (typeof username !== 'undefined') updateData.username = username
    if (typeof email !== 'undefined') updateData.email = email
    if (typeof picture !== 'undefined') updateData.picture = picture
    if (typeof interests !== 'undefined')
      updateData.interests = JSON.stringify(interests)

    await user.update(updateData)

    const { accessToken, refreshToken } = generateTokens(user.id)
    await user.update({ refreshToken })

    let returnedInterests: any = []
    try {
      returnedInterests = user.interests ? JSON.parse(user.interests) : []
    } catch (e) {
      returnedInterests = []
    }

    res.json({
      status: 'Success',
      message: 'Profil mis à jour avec succès',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        verified: user.verified,
        interests: returnedInterests,
        picture: user.picture,
      },
    })
  } catch (err) {
    console.error("Erreur d'update utilisateur :", err)
    res
      .status(500)
      .json({
        status: 'Failed',
        message: 'Erreur lors de la mise à jour du profil',
      })
  }
}

const createUser = async (req, res) => {
  try {
    const { username, password, email, interests } = req.body;

    const user = await User.findOne({ where: { email } });

    if (user) {
      return res.status(400).json({
        status: "Failed",
        message: "Cet email existe déjà",
      });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      interests,
      verified: false,
    });

    const userId = newUser.id;

    const { accessToken, refreshToken } = generateTokens(userId);

    await newUser.update({ refreshToken });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      status: "Success",
      message: "Utilisateur créé avec succès",
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        verified: newUser.verified,
        interests: newUser.interests,
        picture: newUser.picture,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "Failed",
      message: "Erreur création utilisateur",
    });
  }
};
const logoutUser = async (req, res) => {
  try {

    const token = req.cookies.refreshToken;

    if (token) {

      const user = await User.findOne({
        where: { refreshToken: token }
      });

      if (user) {
        await user.update({
          refreshToken: null
        });
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.json({
      status: "Success",
      message: "Déconnecté",
    });

  } catch (err) {
    return res.status(500).json({
      status: "Failed",
      message: "Erreur logout",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "Failed",
        message: "Email et mot de passe requis",
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        status: "Failed",
        message: "Email incorrect",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        status: "Failed",
        message: "Mot de passe incorrect",
      });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    await user.update({ refreshToken });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      status: "Success",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        verified: user.verified,
        interests: user.interests,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "Failed",
      message: "Erreur login",
    });
  }
};

const refreshTokenHandler = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({
        status: "Failed",
        message: "Refresh token manquant",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findByPk(decoded.userId);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        status: "Failed",
        message: "Refresh token invalide",
      });
    }

    const { accessToken, refreshToken: newRefreshToken } =
      generateTokens(user.id);

    await user.update({ refreshToken: newRefreshToken });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      status: "Success",
      accessToken,
    });

  } catch (err) {
    return res.status(401).json({
      status: "Failed",
      message: "Refresh token expiré ou invalide",
    });
  }
};
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId
    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'username',
        'email',
        'verified',
        'interests',
        'picture',
        'isTemporary',
      ],
    })

    if (!user) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Utilisateur non trouvé',
      })
    }
    const plainUser = user.get({ plain: true })

    res.json({
      status: 'Success',
      user: plainUser,
    })
  } catch (err) {
    console.error('Erreur récupération profil:', err)
    res.status(401).json({
      status: 'Failed',
      message: 'Erreur lors de la récupération du profil',
    })
  }
}

export {
  createUser,
  loginUser,
  refreshTokenHandler,
  updatedProfile,
  getCurrentUser,
  logoutUser
}
