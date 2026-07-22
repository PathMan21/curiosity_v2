import jwt from 'jsonwebtoken'
import { stringify } from 'querystring'
import User from '../Models/User'

import '../Helpers/configLink'
const validateUserOauth = (req, res, next) => {
  const { username, interests, password } = req.body

  const pwdValidate =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  const usernameValidate = /^[a-zA-Z0-9 ]*$/

  if (!password || pwdValidate.test(password) == false) {
    return res.status(400).json({ message: 'mot de passe invalide' })
  }
  if (!username || usernameValidate.test(username) == false) {
    return res.status(400).json({ message: 'username invalide' })
  }
  if (
    interests &&
    (!Array.isArray(interests) ||
      interests.length === 0 ||
      interests.length > 10)
  ) {
    return res.status(400).json({
      message: 'intérêts invalides: doit être un tableau de 1-10 éléments',
    })
  }

  next()
}

const validateUser = (req, res, next) => {
  const { username, email, interests, password } = req.body

  const emailValidate = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim
  const pwdValidate =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  const usernameValidate = /^[a-zA-Z0-9 ]{3,50}$/

  if (!email || !emailValidate.test(email)) {
    return res.status(400).json({ message: 'Email invalide' })
  }
  if (!password || !pwdValidate.test(password)) {
    return res.status(400).json({
      message:
        'Le mot de passe doit contenir au moins 8 caractères avec majuscule, minuscule, chiffre et caractère spécial (@$!%*?&)',
    })
  }
  if (!username || !usernameValidate.test(username)) {
    return res
      .status(400)
      .json({ message: 'Username invalide (3-50 caractères alphanumériques)' })
  }

  next()
}

const authentificatedUser = async (req, res, next) => {
  try {
    const header = req.headers.authorization

    if (!header) {
      return res.status(401).json({ error: 'Token manquant' })
    }

    const token = header.split(' ', 2)

    if (!token || !token[1]) {
      return res.status(401).json({ error: 'Token invalide ou mal formaté' })
    }

    let decoded
    try {
      decoded = jwt.verify(token[1], process.env.ACCESS_TOKEN_SECRET)
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expiré' })
      }
      return res.status(401).json({ error: 'Token invalide' })
    }

    let id = decoded.userId
    const user = await User.findByPk(id)

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(500).json({ error: 'Erreur serveur' })
  }
}
export { validateUser, authentificatedUser, validateUserOauth }
