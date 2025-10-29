import type { Request, Response } from "express";
import { ApiError } from "../utils/Api.Error";
import { db } from "../db";
import { usersTable } from "../models";
import { eq } from "drizzle-orm";
import { uploadImageToCloudinary } from "../utils/uploadToCloudinary";

const signupUser = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, gender, password } = req.body;

        // Validate fields
        if ([firstName, lastName, email, gender, password].some(field => !field || field.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        // Check if user already exists
        const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, email));

        if (existingUser) {
            throw new ApiError(409, "User with this email already exists!");
        }

        // Get file to upload and store it temporarily in the public/temp folder
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const profileImageLocalPath = files?.profileImage?.[0]?.path;

        if (!profileImageLocalPath) {
            throw new ApiError(400, "Profile-image file is missing")
        }

        // Upload the file from public/temp to Cloudinary
        const profileImage = await uploadImageToCloudinary(profileImageLocalPath, "Authentication");

        // Insert user into the database
        const [createdUser] = await db.insert(usersTable).values({
            firstName,
            lastName,
            gender,
            email,
            password,
            profileImage: profileImage?.secure_url
        }).returning();

        // Check if user creation was successful
        if (!createdUser) {
            throw new ApiError(404, "Failed to register the user");
        }

        return res.status(201).json({ message: "User created Successfully", data: createdUser });

    } catch (error) {
        console.error("The error is : ", error);
        throw new ApiError(500, "Internal Server Error");
    }
}

const loginUser = async (req: Request, res: Response) => {
    try {
        return res.status(200).json({ data: "Login Controller" });
    } catch (error) {
        throw new ApiError(500, "Internal Server Error");
    }
}

export { signupUser, loginUser }