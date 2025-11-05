import { Router } from "express";
import { forgotPassword, loginUser, resetPassword, signupUser } from "../controllers/auth.controller";
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.route('/signup').post(upload.fields([{ name: 'profileImage', maxCount: 1 }]), signupUser);
router.route('/login').post(loginUser);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password').post(resetPassword);

export default router 