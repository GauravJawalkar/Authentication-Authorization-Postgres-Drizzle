import type { Request, Response } from "express";
import { ApiError } from "../utils/Api.Error";
import { db } from "../db";
import { resetPasswordTable, usersTable } from "../models";
import { eq } from "drizzle-orm";
import { uploadImageToCloudinary } from "../helpers/uploadToCloudinary";
import bcrypt from 'bcrypt'
import { generateAccessToken, generateRefreshToken } from "../helpers/tokens";
import { sendEmail } from "../helpers/email";

const signupUser = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, gender, password } = req.body;

        // Validate fields
        if ([firstName, lastName, email, gender, password].some(field => !field || field.trim() === "")) {
            return res.json(new ApiError(400, "All fields are required")).status(400);
        }

        // Check if user already exists
        const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));

        if (existingUser) {
            return res.json(new ApiError(409, "User with this email already exists!")).status(409);
        }

        // Get file to upload and store it temporarily in the public/temp folder
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const profileImageLocalPath = files?.profileImage?.[0]?.path;

        if (!profileImageLocalPath) {
            return res.json(new ApiError(400, "Profile-image file is missing")).status(400)
        }

        // Upload the file from public/temp to Cloudinary
        const profileImage = await uploadImageToCloudinary(profileImageLocalPath, "Authentication");

        // encrypt password before storing
        const encryptedPassword = bcrypt.hashSync(password, Number(process.env.SALT_ROUNDS!)).toString();

        // Insert user into the database
        const [createdUser] = await db.insert(usersTable).values({
            firstName,
            lastName,
            gender,
            email,
            password: encryptedPassword,
            profileImage: profileImage?.secure_url
        }).returning();

        // Check if user creation was successful
        if (!createdUser) {
            return res.json(new ApiError(404, "Failed to register the user")).status(404);
        }

        return res.status(201).json({ message: "User created Successfully", data: createdUser });

    } catch (error) {
        console.error("The error is : ", error);
        return res.json(new ApiError(500, "Internal Server Error")).status(500);
    }
}

const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check if details are provided
        if ([email, password].some(field => !field || field.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        // Check if user exists
        const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

        if (!user) {
            return res.status(404).json(new ApiError(404, "User not found with the given email"))
        }

        // Decrypt the password
        const isPasswordValid = bcrypt.compareSync(password, user?.password);

        // If user exist check the given password matches with the one in the database
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const loggedUser = user;

        // Access token creation and payload
        const payload = {
            id: loggedUser?.id,
            name: loggedUser?.firstName,
            email: loggedUser?.email,
            gender: loggedUser?.gender,
            role: loggedUser?.role
        }

        const accessToken = generateAccessToken(payload);

        const refreshToken = generateRefreshToken(payload);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict"
        })

        const userDetails = { ...loggedUser, accessToken };

        // Returning the logged User data
        return res.status(200).json({ message: "Logged In Successfully", user: userDetails });

    } catch (error) {
        console.error("The error is : ", error);
        throw new ApiError(500, "Internal Server Error");
    }
}

const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (email.trim() === "") {
            return res.json(new ApiError(400, "Email is required")).status(400);
        }

        const response = await sendEmail(email, "forgotPassword", res);

        if (!response) {
            return res.json(new ApiError(500, "Failed to send OTP")).status(500);
        }

        return res.status(200).json({ message: "OTP sent to the email successfully" });

    } catch (error) {
        console.error("Error Resetting password : ", error);
        return res.json(new ApiError(500, "Internal Server Error")).status(500)
    }
}

const resetPassword = async (req: Request, res: Response) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (email.trim() === "" || otp.trim() === "" || newPassword.trim() === "") {
            return res.json(new ApiError(400, "Please provide email and otp")).status(400);
        }

        const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

        if (!user) {
            return res.status(404).json(new ApiError(404, "User not found with the given email"));
        }

        const [passwordResetRecord] = await db.select().from(resetPasswordTable).where(eq(resetPasswordTable.userId, user.id));

        if (!passwordResetRecord) {
            return res.status(400).json(new ApiError(400, "Invalid OTP or User"));
        }

        const isOtpValid = bcrypt.compareSync(otp, passwordResetRecord?.otp);

        if (!isOtpValid) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (passwordResetRecord.expiresAt < new Date()) {
            return res.status(400).json(new ApiError(400, "OTP has expired"));
        }

        const encryptedPassword = bcrypt.hashSync(newPassword, Number(process.env.SALT_ROUNDS!));

        const response = await db.update(usersTable).set({ password: encryptedPassword }).where(eq(usersTable.id, user?.id)).returning();

        if (response.length > 0) {
            await db.delete(resetPasswordTable).where(eq(resetPasswordTable.userId, user.id));
        } else {
            return res.status(500).json(new ApiError(500, "Failed to reset the password"));
        }

        return res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        console.error("Error resetting the password : ", error)
        return res.status(500).json(new ApiError(500, "Error Resetting the password"));
    }
}

export { signupUser, loginUser, forgotPassword, resetPassword }