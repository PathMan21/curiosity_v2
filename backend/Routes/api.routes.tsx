import { Router } from "express";
import handleOpenAlex from "backend/Services/api-externes.services";
import { authentificatedUser } from '../Middlewares/user.middlewares';
const router = Router();

// arxiv me sert pour des données techniques - a utiliser peu
router.get('/generalInfos/' ,authentificatedUser, handleOpenAlex);

// api qui

export default router;
