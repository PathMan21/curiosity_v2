import { Router } from "express";
import { oauthVerify } from "backend/Controllers/oauth.controllers";
import { oauthToken } from "backend/Controllers/oauth.controllers";
import { authentificatedUser } from "backend/Middlewares/user.middlewares";
import { updateProfile } from "backend/Controllers/oauth.controllers";
import bodyParser from "body-parser";

const router = Router();
import cors from "cors";

var corsOption = {
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200

};

router.get("/google/url", cors(corsOption), oauthVerify);
router.get("/google/callback", oauthToken);
router.post("/complete-inscription", bodyParser.json(), authentificatedUser, updateProfile);


export default router;
