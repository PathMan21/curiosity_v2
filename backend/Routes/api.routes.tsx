import { Router } from "express";
import handleArxiv from "backend/Services/api-externes.services";
const router = Router();

router.get('/generalInfos/', handleArxiv);

export default router;
