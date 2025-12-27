import router from "backend/Routes/user.routes";
import User from "backend/Models/User";
import jwt from "jsonwebtoken";
const baseUrl = process.env.BASE_URL_FRONT;

const googleAuthId = process.env.ID_OAUTH;
const googleAuthUrl = process.env.URL_OAUTH;
const state = "test";
const googleAuthCallback = process.env.CALLBACK_OAUTH;
  
// scope : 
const GOOGLE_OAUTH_SCOPES = [
  process.env.SCOPE1,
  process.env.SCOPE2
];
const URL_EXCHANGE = process.env.URL_EXCHANGE;
const URL_TOKEN = process.env.TOKEN_URL_OAUTH;

const scopes = GOOGLE_OAUTH_SCOPES.join(" ");
const GOOGLE_OAUTH_CONSENT_SCREEN_URL = `${googleAuthUrl}?client_id=${googleAuthId}&redirect_uri=${googleAuthCallback}&access_type=offline&response_type=code&state=${state}
&scope=${encodeURIComponent(scopes)}`;

const oauthVerify = async (req, res) => {
    res.json({
        url: GOOGLE_OAUTH_CONSENT_SCREEN_URL
    });
};

const oauthToken = async (req, res) => {
console.log("vous avez appelé le callback de oAuth");

    const { code } = req.query;
      if (!code) {
        return res.status(400).send("Code manquant dans le callback");
      }
    const data = {
        code,
        client_id: process.env.ID_OAUTH,
        client_secret: process.env.MDP_OAUTH,
        redirect_uri: process.env.CALLBACK_OAUTH,
        grant_type: "authorization_code",
        
    }

    console.log(data);

    // quand on choppe le code, on renvoie au serveur d'autorisation pour avoir en échange le token

      const response = await fetch(URL_EXCHANGE, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data),
      });
    const accessToken = await response.json();
    const { id_token } = accessToken;

    const tokenInfoResponse = await fetch(`${URL_TOKEN}?id_token=${id_token}`);

    // on récupère le token avec toutes les informations

    const { name, picture, email, email_verified } = await tokenInfoResponse.json();

    console.log("picture " + picture)
    console.log("email " + email)
    console.log("name " + name)
    console.log("email_verified " + email_verified)

    // on check si l'utilisateur existe déjà
    let existingUser = await User.findOne({ where: { email } }) as User | null;

      console.log("existing user " + existingUser);
    if (existingUser) {
        console.log("utilisateur existant : " + email);
        return res.status(418).send("Utilisateur déjà existant : " + email);
    } else {
      console.log("création user :");

      existingUser = await User.create({
        username: name,
        email,
        password: "oauth_placeholder",
        picture,
        isTemporary: true
      });
      await existingUser.reload();

    console.log("Nouvel utilisateur créé :", existingUser.toJSON());


const signToken = (payload, secret, options) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
      if (err) reject(err);
      else resolve(token);
    });
  });
};

try {
  const jwtToken = await signToken(
    { userId: existingUser.id, email: existingUser.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "1h" }
  );

  res.cookie("jwt", jwtToken, { 
    httpOnly: true, 
    secure: true,
    sameSite: 'strict'
  });

  res.redirect(`${baseUrl}complete-inscription?token=${jwtToken}`);
} catch (err) {
  return res.status(500).json({ error: 'Erreur génération token' });
}

    }

}


const updateProfile = async (req, res) => {
 const { username, password, interests } = req.body;
  console.log(req.body)
  let selectedinterests = JSON.stringify(interests);
  console.log("selectedinterests " + selectedinterests);
  const user = await User.findByPk(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: "Utilisateur introuvable" });
  }
  user.username = username || user.username;
  user.password = password || user.password;
  user.interests = selectedinterests;
  user.isTemporary = false;

  await user.save();

  console.log(user);
  res.status(200).json({ message: "Profil complété", user });
};


export { oauthVerify, oauthToken, updateProfile};