import { Router } from "express";
import { getUser } from "../controllers/user.controller";
import { userDetails } from "../middlewares/auth.middleware";

const router = Router();

router.route('/').get(userDetails, getUser);

export default router