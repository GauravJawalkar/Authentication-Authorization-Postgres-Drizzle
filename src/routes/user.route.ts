import { Router } from "express";
import { getUser } from "../controllers/user.controller";
import { verifyUserJwt } from "../middlewares/auth.middleware";

const router = Router();

router.route('/').get(verifyUserJwt, getUser);

export default router