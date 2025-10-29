import { Router } from "express";
import { login, signup } from "../controllers/auth.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.route('/signup').post(upload.fields([{ name: 'profileImage', maxCount: 1 }]), signup)
router.route('/login').post(login)

export default router 