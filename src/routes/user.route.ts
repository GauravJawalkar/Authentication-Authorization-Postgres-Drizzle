import { Router } from "express";
import { getUser } from "../controllers/user.controller";
import { verifyUserJwt } from "../middlewares/jwt.middleware";
import { isAdminRole } from "../middlewares/role.middleware";

const adminRestrictMiddleware = isAdminRole('admin');

const router = Router();

router.route('/').get(verifyUserJwt, adminRestrictMiddleware, getUser);

export default router