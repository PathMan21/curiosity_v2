import User from '../Models/User'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import { transport } from '../Config/emailConfig'
import UserVerifications from '../Models/UserVerifications'
import path from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import jwt from 'jsonwebtoken'

import '../Helpers/configLink'

const generateTokens = (userId: number) => ({
  accessToken: jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  }),
  refreshToken: jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  }),
})

const verifyUser = async (req, res) => {
  try {
    let { userId, uniqueString } = req.params

    const result = await UserVerifications.findOne({
      where: { userId: userId },
    })

    if (!result) {
      throw new Error(
        "L'account n'existe pas ou le lien de vérification est invalide"
      )
    }

    if (result.get('expiresAt') < new Date()) {
      await UserVerifications.destroy({ where: { userId: userId } })
      return res.status(400).json({
        message: 'Le lien de vérification a expiré',
      })
    }

    const isValid = await bcrypt.compare(
      uniqueString,
      result.get('uniqueString')
    )

    if (!isValid) {
      return res.status(400).json({
        message: 'Lien de vérification invalide',
      })
    }

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé',
      })
    }

    await User.update({ verified: true }, { where: { id: userId } })

    await UserVerifications.destroy({ where: { userId: userId } })

    const { refreshToken } = generateTokens(user.id)

    await user.update({ refreshToken })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return res.redirect(`/api/user/verified`)
  } catch (error) {
    return res.status(500).json({
      message: "Erreur lors de la vérification de l'email",
    })
  }
}

const verifiedPage = async (req, res) => {
  const __filename = fileURLToPath(import.meta.url)
  res.sendFile(path.join(dirname(__filename), '../Assets/Page/VerifyPage.html'))
}

const sendVerificationEmail = async ({ id, email }, res) => {
  try {
    if (!id) {
      return res.status(400).json({
        status: 'Failed',
        message: 'ID utilisateur manquant',
      })
    }

    const currentUrl = process.env.SERVER_URL
    const uniqueString = uuidv4() + id

    const saltRounds = 10

    const hasheduniqueString = await withTimeout(
      bcrypt.hash(uniqueString, saltRounds),
      5000
    )

    const userIdForDb = typeof id === 'string' ? parseInt(id, 10) : id

    if (Number.isNaN(userIdForDb)) {
      return res.status(400).json({
        status: 'Failed',
        message: 'ID utilisateur invalide',
      })
    }

    await UserVerifications.create({
      userId: userIdForDb,
      uniqueString: hasheduniqueString,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 600000),
    })

    const { data, error } = await withTimeout(
      transport.emails.send({
        from: 'Be Curious <noreply@be-curious.fr>',
        to: email,
        subject: 'Vérifiez votre email',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Bienvenue !</h2>

            <p>
              Merci de vous être inscrit !
              Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email.
            </p>

            <p><b>Ce lien expire dans 10 minutes.</b></p>

            <br>

            <a
              href="${currentUrl}/api/user/verify/${id}/${uniqueString}"
              style="
                background-color:#4CAF50;
                color:white;
                padding:12px 24px;
                text-decoration:none;
                border-radius:18px;
                display:inline-block;
              "
            >
              Vérifier mon email
            </a>

            <br><br>

            <p style="color:#666;font-size:12px;">
              Si vous n'êtes pas à l'origine de cette inscription,
              vous pouvez ignorer cet email.
            </p>
          </div>
        `,
      }),
      5000
    )

    if (error) {
      return res.status(500).json({
        status: 'Failed',
        message: "Erreur lors de l'envoi de l'email",
      })
    }

    return res.status(200).json({
      status: 'PENDING',
      message: 'Email de vérification envoyé avec succès',
    })
  } catch (error) {
    return res.status(500).json({
      status: 'Failed',
      message: "Erreur lors de l'envoi de l'email de vérification",
    })
  }
}
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    ),
  ])
}
export { sendVerificationEmail, verifyUser, verifiedPage }
