import jwt from 'jsonwebtoken'
import { stringify } from 'querystring'
import User from '../Models/User'

import "../Helpers/configLink";
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

  next()
}

const validateUser = (req, res, next) => {
  const { username, email, interests, password } = req.body

  const emailValidate = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim
  const pwdValidate =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  const usernameValidate = /^[a-zA-Z0-9 ]*$/

  if (!email || emailValidate.test(email) == false) {
    return res.status(400).json({ message: 'Mail invalide' })
  }
  if (!password || pwdValidate.test(password) == false) {
    return res.status(400).json({ message: 'mot de passe invalide' })
  }
  if (!username || usernameValidate.test(username) == false) {
    return res.status(400).json({ message: 'username invalide' })
  }

  next()
}

const authentificatedUser = async (req, res, next) => {

  // Je vais chercher les headers ( req )
  // je décrypte le  jwt 
  // si pas de jwt ou autre je renvoie une erreur
  // sinon je valide et je renvoie
  console.log("test")
  const header = req.headers.authorization;

  const token = header.split(" ", 2);

  if (!token) {

    res.status(404).send("Token invalide ou introuvable");


  } else {

    const decoded = jwt.verify(
      token[1],
      process.env.ACCESS_TOKEN_SECRET
    )
    let id = decoded.userId;
    const user = await User.findByPk(id)

    if (!user) {
      return res.status(401).send("Utilisateur introuvable")
    }
    req.user = user
    next()


  }

}
export { validateUser, authentificatedUser, validateUserOauth }
