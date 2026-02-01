
import User from "../Models/User";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { transport } from "../Config/emailConfig";
import UserVerifications from "../Models/UserVerifications";
import path from "path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import jwt from "jsonwebtoken";


const verifyUser = async (req, res) => {
  try {
    console.log("verify access")
    let { userId, uniqueString } = req.params;

    const result = await UserVerifications.findOne({ 
      where: { userId: userId }
    });

    if (!result) {
      return res.status(404).json({ 
        message: "L'account n'existe pas ou le lien de vérification est invalide" 
      });
    }

    if (result.get('expiresAt') < new Date()) {
      await UserVerifications.destroy({ where: { userId: userId } });
      return res.status(400).json({ 
        message: "Le lien de vérification a expiré" 
      });
    }

    const isValid = await bcrypt.compare(uniqueString, result.get('uniqueString'));
    
    if (!isValid) {
      return res.status(400).json({ 
        message: "Lien de vérification invalide" 
      });
    }

    const user = await User.findByPk(userId);
    
    await User.update(
      { verified: true }, 
      { where: { id: userId } }
    );

    await UserVerifications.destroy({ where: { userId: userId } });

    // Générer un JWT token pour la redirection
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    return res.redirect(`/api/users/verified?token=${jwtToken}`);

  } catch (error) {
    console.error("Erreur vérification:", error);
    return res.status(500).json({ 
      message: "Erreur lors de la vérification de l'email" 
    });
  }
};

const verifiedPage = async (req, res) => {
  const __filename = fileURLToPath(import.meta.url);
  console.log("fonctionne");
  res.sendFile(path.join(dirname(__filename), "../Assets/Page/VerifyPage.html"));
};

const sendVerificationEmail = async ({ id, email }, res) => {
  try {
    // Vérifier la présence de l'id utilisateur
    if (!id) {
      console.error("sendVerificationEmail: id utilisateur manquant", { id, email });
      return res.status(400).json({ status: "Failed", message: "ID utilisateur manquant" });
    }

    const currentUrl = `http://localhost:3000/`;
    const uniqueString = uuidv4() + id;
    
    console.log("Token généré:", uniqueString, "pour userId:", id);

    const options = {
      from: process.env.AUTH_MAIL,
      to: email,
      subject: "Vérifiez votre email",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Bienvenue ! 🎉</h2>
          <p>Merci de vous être inscrit. Veuillez vérifier votre email pour activer votre compte.</p>
          <p><b>⏰ Ce lien expire dans 10 minutes</b></p>
          <br>
          <a href="${currentUrl}api/users/verify/${id}/${uniqueString}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; display: inline-block;">
            Vérifier mon email
          </a>
          <br><br>
          <p style="color: #666; font-size: 12px;">
            Si vous n'avez pas créé ce compte, ignorez cet email.
          </p>
        </div>
      `,
    };

    const saltRounds = 10;
    const hasheduniqueString = await bcrypt.hash(uniqueString, saltRounds);
    
    console.log("Token haché:", hasheduniqueString);

    // S'assurer que userId est un nombre (coercition si nécessaire)
    const userIdForDb = typeof id === "string" ? parseInt(id, 10) : id;
    if (Number.isNaN(userIdForDb)) {
      console.error("userId invalide pour UserVerifications.create:", id);
      return res.status(400).json({ status: "Failed", message: "ID utilisateur invalide" });
    }

    await UserVerifications.create({
      userId: userIdForDb,
      uniqueString: hasheduniqueString,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 600000),
    });

    await transport.sendMail(options);

    res.status(200).json({
      status: "PENDING",
      message: "Email de vérification envoyé avec succès"
    });

  } catch (error) {
    console.error("Erreur envoi email:", error);
    res.status(500).json({
      status: "Failed",
      message: "Erreur lors de l'envoi de l'email de vérification"
    });
  }
};

export { sendVerificationEmail, verifyUser, verifiedPage };

