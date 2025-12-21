

import jwt from "jsonwebtoken";

const validateUser = (req, res, next) => {
    console.log(req.body);
    const { username, email, interests, password } = req.body;
    
    const emailValidate = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;
    const pwdValidate = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character:
    const usernameValidate = /^[a-zA-Z0-9 ]*$/;

    if (!email || emailValidate.test(email) == false) {
        return res.status(400).json({ message: "Mail invalide" });
    }
    if (!password || pwdValidate.test(password) == false) {
        return res.status(400).json({ message: "mot de passe invalide" });
    }
    if (!username || usernameValidate.test(username) == false) {
        return res.status(400).json({ message: "username invalide" });
    }

    next();

};


const authentificatedUser = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token || token == undefined) {
    return res.status(401).json({ message: "Token manquant" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
        return res.status(403).json({ message: "Erreur", error: err.message });
    }
    req.user = user;
    next();
  });

}
export { validateUser, authentificatedUser };