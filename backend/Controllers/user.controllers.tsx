import User from '../Models/User'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import "../Helpers/configLink"
import { createUserSchema, updateUserSchema } from '../dtos/User'

const generateTokens = (userId: number) => ({
  accessToken: jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }),
})

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
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
      return res.status(400).json({
        status: 'Failed',
        message: 'Cet email existe déjà',
      })
    }

    const user = await User.create({
      username,
      email,
      password,
      interests,
      verified: false,
    })

    const { accessToken, refreshToken } = generateTokens(user.id)

    await user.update({ refreshToken })

    setRefreshCookie(res, refreshToken)

    return res.status(201).json({
      status: 'Success',
      accessToken,
      user: formatUser(user),
    })

  } catch (error) {
    return res.status(500).json({
      status: 'Failed',
      message: 'Erreur création utilisateur',
    })
  }
}

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password)
      return res.status(400).json({ status: 'Failed', message: 'Email et mot de passe requis' })

    const user = await User.findOne({ where: { email } })
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ status: 'Failed', message: 'Identifiants incorrects' })

    const { accessToken, refreshToken } = generateTokens(user.id)
    await user.update({ refreshToken })
    setRefreshCookie(res, refreshToken)

    return res.json({ status: 'Success', accessToken, user: formatUser(user) })
  } catch {
    return res.status(500).json({ status: 'Failed', message: 'Erreur login' })
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

  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({
      message: 'Pas de refresh token'
    })
  }

  try {

    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET
    )

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
      attributes: ['id', 'username', 'email', 'verified', 'interests', 'picture', 'isTemporary'],
    })

    if (!user) return res.status(404).json({ status: 'Failed', message: 'Utilisateur non trouvé' })

    return res.json({ status: 'Success', user: user.get({ plain: true }) })
  } catch {
    return res.status(401).json({ status: 'Failed', message: 'Erreur récupération profil' })
  }
}

export const updatedProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) {
      return res.status(404).json({ status: 'Failed', message: 'Utilisateur non trouvé' })
    }

    const result = updateUserSchema.safeParse(req.body)

    if (!result.success) {
      console.log(result.error)
      return res.status(400).json({
        status: 'Failed',
        errors: result.error,
      })
    }

    const { username, email, interests, picture } = result.data

    // Check if email is already used by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { email },
      })
      if (existingUser) {
        return res.status(400).json({
          status: 'Failed',
          message: 'Cet email existe déjà',
        })
      }
    }

    const updateData = {}
    if (username !== undefined) updateData.username = username
    if (email !== undefined) updateData.email = email
    if (picture !== undefined) updateData.picture = picture
    if (interests !== undefined) updateData.interests = JSON.stringify(interests)

    await user.update(updateData)

    const { accessToken, refreshToken } = generateTokens(user.id)

    await user.update({ refreshToken })
    setRefreshCookie(res, refreshToken)

    return res.json({ status: 'Success', accessToken, user: formatUser(user) })
  } catch {
    return res.status(500).json({ status: 'Failed', message: 'Erreur mise à jour profil' })
  }
}