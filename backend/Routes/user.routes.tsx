import { Router } from "express";
// import { createUser } from './contoller';
import { validateUser } from '../Middlewares/user.middlewares';
import validateByMail from "backend/Middlewares/mail.middlewares";
import bodyParser from "body-parser";
import { createUser, loginUser } from "backend/Controllers/user.controllers";
import { verifiedPage, verifyUser } from "../Services/mail.services";
const router = Router();

router.post('/',  bodyParser.json(), validateUser, validateByMail, createUser);
router.post('/login', bodyParser.json(), loginUser);
router.get('/verify/:userId/:uniqueString', verifyUser);
router.get('/verified', verifiedPage);


export default router;
