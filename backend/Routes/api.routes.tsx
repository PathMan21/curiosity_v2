import { Router } from "express";
import handleOpenAlex from "backend/Services/api-externes.services.handleOpenAlex";
import handleNewsmech from "backend/Services/api-externes.services.handleNewsmech";
import { authentificatedUser } from '../Middlewares/user.middlewares';
const router = Router();

// arxiv me sert pour des données techniques - a utiliser peu
router.get('/generalInfos/' ,authentificatedUser, handleNewsmech);
// router.get('/generalInfos/news/', authentificatedUser, handleNewsmech);

export default router;
