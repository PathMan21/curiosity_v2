import router from '../Routes/user.routes'
import User from '../Models/User'
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { randomBytes } from 'crypto'

import '../Helpers/configLink'

const generateTokens = (userId: number) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 15 * 60,
  })
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: 7 * 24 * 60 * 60,
  })
  return { accessToken, refreshToken }
}

const oauthVerify = async (req, res) => {
  try {
    if (!req.session) {
      return res.status(500).json({ error: 'Session not initialized' })
    }

    const googleAuthUrl = process.env.URL_OAUTH
    const googleAuthId = process.env.ID_OAUTH
    const googleAuthCallback = process.env.CALLBACK_OAUTH
    const scopes = [process.env.SCOPE1, process.env.SCOPE2].join(' ')

    const state = randomBytes(32).toString('hex')
    req.session.oauthState = state

    const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${googleAuthUrl}?client_id=${googleAuthId}&redirect_uri=${googleAuthCallback}&access_type=offline&response_type=code&state=${state}&scope=${encodeURIComponent(scopes)}`

    res.json({ url: GOOGLE_OAUTH_CONSENT_SCREEN_URL })
  } catch (err) {
    console.error('OAuth verify error:', err)
    res.status(500).json({ error: 'OAuth initialization failed' })
  }
}

const verifyToken = async (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      message: 'on a réussis à authentifié le token',
    })
  } catch (err) {
    console.log('error : ', err)
  }
}

const oauthToken = async (req, res) => {
  try {
    const { code, state } = req.query

    if (!req.session) {
      return res.status(500).json({ error: 'Session not initialized' })
    }

    if (!state || !req.session.oauthState) {
      return res
        .status(400)
        .json({ error: 'État CSRF invalide: state manquant' })
    }

    if (state !== req.session.oauthState) {
      return res
        .status(400)
        .json({ error: 'État CSRF invalide: state non valide' })
    }

    if (!code) {
      return res.status(400).json({ error: 'Code manquant dans le callback' })
    }

    const data = {
      code,
      client_id: process.env.ID_OAUTH,
      client_secret: process.env.MDP_OAUTH,
      redirect_uri: process.env.CALLBACK_OAUTH,
      grant_type: 'authorization_code',
    }

    const URL_EXCHANGE = process.env.URL_EXCHANGE
    const URL_TOKEN = process.env.TOKEN_URL_OAUTH

    const response = await fetch(URL_EXCHANGE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data),
    })
    const accessToken = await response.json()

    if (!accessToken.id_token) {
      return res.status(400).json({ error: 'ID token non reçu' })
    }

    const { id_token } = accessToken

    const tokenInfoResponse = await fetch(`${URL_TOKEN}?id_token=${id_token}`)

    if (!tokenInfoResponse.ok) {
      return res
        .status(400)
        .json({ error: 'Erreur lors de la vérification du token' })
    }

    const { name, picture, email } = await tokenInfoResponse.json()

    if (!email) {
      return res.status(400).json({ error: 'Email non reçu du provider OAuth' })
    }

    let existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      const { accessToken: jwtAccessToken, refreshToken: jwtRefreshToken } =
        generateTokens(existingUser.id)
      await existingUser.update({ refreshToken: jwtRefreshToken })

      res.cookie('refreshToken', jwtRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      res.cookie('jwt', jwtAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      })

      return res.redirect(`${process.env.BASE_URL_FRONT}`)
    }

    const newUser = await User.create({
      username: name,
      email,

      password: randomBytes(32).toString('hex'),
      picture,
      isTemporary: true,
    })

    try {
      const { accessToken: jwtAccessToken, refreshToken: jwtRefreshToken } =
        generateTokens(newUser.id)

      await newUser.update({ refreshToken: jwtRefreshToken })

      res.cookie('refreshToken', jwtRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      res.cookie('jwt', jwtAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      })

      res.redirect(`${process.env.BASE_URL_FRONT}complete-inscription`)
    } catch (err) {
      return res
        .status(500)
        .json({ error: 'Erreur génération token', details: err.message })
    }
  } catch (err) {
    console.error('OAuth token error:', err)
    return res.status(500).json({ error: 'OAuth token exchange failed' })
  }
}

const updateProfile = async (req, res) => {
  const { username, password, interests } = req.body

  const userId = req.user?.id

  if (!userId) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' })
  }

  const user = await User.findByPk(userId)
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' })
  }

  const updateData: any = {}
  if (typeof username !== 'undefined') updateData.username = username
  if (typeof interests !== 'undefined')
    updateData.interests = JSON.stringify(interests)

  await user.update(updateData)

  try {
    await user.reload()

    const { accessToken, refreshToken } = generateTokens(user.id)
    await user.update({ refreshToken })

    try {
      res.cookie('jwt', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      })
    } catch (cookieErr) {
      console.warn('Impossible de définir le cookie jwt:', cookieErr)
    }

    const userData = user.get({ plain: true })
    if (userData.interests && typeof userData.interests === 'string') {
      try {
        userData.interests = JSON.parse(userData.interests)
      } catch (e) {
        userData.interests = []
      }
    }

    delete userData.refreshToken
    delete userData.password

    return res.status(200).json({
      message: 'Profil mis à jour',
      user: userData,
    })
  } catch (err) {
    console.error('Erreur génération token après updateProfile:', err)
    return res
      .status(500)
      .json({ error: 'Erreur lors de la génération du token' })
  }
}

export { oauthVerify, oauthToken, updateProfile, verifyToken }
