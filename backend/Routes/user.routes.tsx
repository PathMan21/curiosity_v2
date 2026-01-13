import { Router } from "express";
// import { createUser } from './contoller';
import { validateUser } from '../Middlewares/user.middlewares';
import validateByMail from "backend/Middlewares/mail.middlewares";
import bodyParser from "body-parser";
import { createUser, loginUser, refreshTokenHandler, updatedProfile } from "backend/Controllers/user.controllers";
import { verifiedPage, verifyUser } from "../Services/mail.services";
const router = Router();

router.post('/',  bodyParser.json(), validateUser, validateByMail, createUser);
router.post('/login', bodyParser.json(), loginUser);
router.post('/refresh-token', bodyParser.json(), refreshTokenHandler);
router.get('/verify/:userId/:uniqueString', verifyUser);
router.get('/verified', verifiedPage);

router.post('/updated-profile',bodyParser.json(), updatedProfile);


export default router;
