import User from '../Models/User'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import '../Helpers/configLink'
import { createUserSchema, updateUserSchema } from '../dtos/User'
import { sendVerificationEmail } from '../Services/mail.services'

const generateTokens = (userId: number) => ({
  accessToken: jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  }),
  refreshToken: jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  }),
})

// 7 jours -> N'autorise que le site
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

const setRefreshCookie = (res, token) =>
  res.cookie('refreshToken', token, COOKIE_OPTIONS)

const formatUser = (user) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  verified: user.verified,
  interests: user.interests,
  picture: user.picture,
})

export const createUser = async (req, res) => {
  try {
    const result = createUserSchema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        status: 'Failed',
        errors: result.error,
      })
    }

    const { username, password, email, interests } = result.data

    const existingUser = await User.findOne({
      where: { email },
    })

    if (existingUser) {
      return res.status(409).json({
        status: 'Failed',
        message: 'Cet email existe déjà',
      })
    }

    const user = await User.create({
      username,
      email,
      password,
      interests: interests || null,
      verified: false,
    })
    try {
      await sendVerificationEmail({ id: user.id, email: user.email }, res)
    } catch (emailError) {
      return res.status(500).json({
        status: 'Failed',
        message: "Erreur lors de l'envoi de l'email de vérification",
      })
    }

    return res.status(201).json({
      status: 'Success',
      message: 'Utilisateur créé, email de vérification envoyé',
      data: { id: user.id, username: user.username, email: user.email },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return res.status(400).json({
      status: 'Failed',
      message,
    })
  }
}

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        status: 'Failed',
        message: 'Email ou mot de passe incorrect',
      })
    }

    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(404).json({
        status: 'Failed',
        message: 'Utilisateur introuvable',
      })
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        status: 'Failed',
        message: 'Mot de passe incorrect',
      })
    }

    if (!user.verified) {
      return res.status(403).json({
        status: 'Failed',
        message: 'Utilisateur non vérifié',
      })
    }

    const { accessToken, refreshToken } = generateTokens(user.id)
    await user.update({ refreshToken })
    setRefreshCookie(res, refreshToken)

    const userData = formatUser(user)

    return res.status(200).json({
      status: 'Success',
      token: accessToken,
      accessToken,
      user: userData,
    })
  } catch (error) {
    return res.status(500).json({
      status: 'Failed',
      message: error instanceof Error ? error.message : 'Erreur serveur',
    })
  }
}

export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies.refreshToken
    if (token) {
      const user = await User.findOne({ where: { refreshToken: token } })
      await user?.update({ refreshToken: null })
    }

    res.clearCookie('refreshToken', COOKIE_OPTIONS)
    return res.json({ status: 'Success', message: 'Déconnecté' })
  } catch {
    return res.status(500).json({ status: 'Failed', message: 'Erreur logout' })
  }
}

export async function refresh(req, res) {
  const token = req.cookies.refreshToken

  try {
    if (!token) {
      throw new Error('Pas de token')
    }

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '15m',
      }
    )
    const user = await User.findByPk(decoded.userId)

    if (!user) {
      throw new Error('User non existant')
    }
    if (user.refreshToken !== token) {
      throw new Error('Refresh token non existant')
    }

    return res.status(200).json({
      status: 'Success',
      token: accessToken,
    })
  } catch (error) {
    return res.status(401).json({ status: 'failed', message: error.message })
  }
}

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
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
      throw new Error('Utilisateur non reconnu')
    }

    const userData = user.get({ plain: true })

    return res.json({ status: 'Success', user: userData })
  } catch (err) {
    return res.status(401).json({ status: 'Failed', message: err.message })
  }
}

export const updatedProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) {
      throw new Error('Utilisateur non reconnu')
    }

    const result = updateUserSchema.safeParse(req.body)

    if (!result.success) {
      throw new Error('update échoué')
    }

    const { username, interests, picture } = result.data

    const updateData = {}
    if (username !== undefined) updateData.username = username
    if (picture !== undefined) updateData.picture = picture
    if (interests !== undefined) updateData.interests = interests

    await user.update(updateData)

    // Reload user from DB to get updated values
    await user.reload()

    const { accessToken, refreshToken } = generateTokens(user.id)

    await user.update({ refreshToken })
    setRefreshCookie(res, refreshToken)

    const userData = formatUser(user)

    return res.json({ status: 'Success', accessToken, user: userData })
  } catch (error) {
    return res.status(500).json({ status: 'Failed', message: error.message })
  }
}
