import { Router } from "express";
import { loginUser, signupUser } from "../controllers/auth.controller";
import { upload } from "../middlewares/multer.middleware";
import { userDetails } from "../middlewares/auth.middleware";

const router = Router();

router.route('/signup').post(upload.fields([{ name: 'profileImage', maxCount: 1 }]), signupUser)
router.route('/login').post(loginUser)

export default router 