import { Router } from "express";
import handleArxiv from "backend/Services/api-externes.services";
import { authentificatedUser } from '../Middlewares/user.middlewares';
const router = Router();

router.get('/generalInfos/' ,authentificatedUser, handleArxiv);

export default router;
