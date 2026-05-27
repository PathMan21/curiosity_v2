import router from '../Routes/user.routes'
import User from '../Models/User'
import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { randomBytes } from 'crypto'

import "../Helpers/configLink";
const baseUrl = process.env.BASE_URL_FRONT

const googleAuthId = process.env.ID_OAUTH
const googleAuthUrl = process.env.URL_OAUTH
const googleAuthCallback = process.env.CALLBACK_OAUTH

const GOOGLE_OAUTH_SCOPES = [process.env.SCOPE1, process.env.SCOPE2]
const URL_EXCHANGE = process.env.URL_EXCHANGE
const URL_TOKEN = process.env.TOKEN_URL_OAUTH

const scopes = GOOGLE_OAUTH_SCOPES.join(' ')

const generateTokens = (userId: number) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: 15 * 60,
  })

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: 60 * 60,
  })
  return { accessToken, refreshToken }
}

const oauthVerify = async (req, res) => {
  const state = randomBytes(32).toString('hex')
  
  req.session.oauthState = state
  
  const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${googleAuthUrl}?client_id=${googleAuthId}&redirect_uri=${googleAuthCallback}&access_type=offline&response_type=code&state=${state}&scope=${encodeURIComponent(scopes)}`
  
  res.json({
    url: GOOGLE_OAUTH_CONSENT_SCREEN_URL,
  })
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
  const { code, state } = req.query
  
  if (!state || state !== req.session?.oauthState) {
    return res.status(400).send('État CSRF invalide')
  }
  
  if (!code) {
    return res.status(400).send('Code manquant dans le callback')
  }
  
  const data = {
    code,
    client_id: process.env.ID_OAUTH,
    client_secret: process.env.MDP_OAUTH,
    redirect_uri: process.env.CALLBACK_OAUTH,
    grant_type: 'authorization_code',
  }


  const response = await fetch(URL_EXCHANGE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(data),
  })
  const accessToken = await response.json()
  const { id_token } = accessToken

  const tokenInfoResponse = await fetch(`${URL_TOKEN}?id_token=${id_token}`)


  const { name, picture, email } =
    await tokenInfoResponse.json()
  let newUser
  let existingUser = await User.findOne({ where: { email } })
  if (existingUser) {
    return res.status(418).send('Utilisateur déjà existant : ' + email)
  } else {
    newUser = await User.create({
      username: name,
      email,
      password: 'oauth_placeholder',
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
      
      res.redirect(`${baseUrl}complete-inscription`)
    } catch (err) {
      return res
        .status(500)
        .json({ error: 'Erreur génération token', details: err.message })
    }
  }
}

const updateProfile = async (req, res) => {
  const { username, password, interests } = req.body
  let selectedinterests = JSON.stringify(interests)

  const userId = req.user?.userId || req.userId

  if (!userId) {
    console.error(
      'updateProfile: userId manquant dans la requête (payload):',
      req.user
    )
    return res.status(401).json({ error: 'Utilisateur non authentifié' })
  }

  const user = await User.findByPk(userId)
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' })
  }
  const updateData: any = {}
  if (typeof username !== 'undefined') updateData.username = username
  if (typeof password !== 'undefined') updateData.password = password
  if (typeof interests !== 'undefined')
    updateData.interests = selectedinterests

  await user.update(updateData)

  try {
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

    return res.status(200).json({
      message: 'Profil mis à jour',
      user: user.get({ plain: true }),
    })
  } catch (err) {
    console.error('Erreur génération token après updateProfile:', err)
    return res
      .status(500)
      .json({ error: 'Erreur lors de la génération du token' })
  }
}

export { oauthVerify, oauthToken, updateProfile, verifyToken }
