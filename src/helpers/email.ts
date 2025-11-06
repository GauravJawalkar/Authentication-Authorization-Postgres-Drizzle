import { db } from '../db';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import nodemailer from 'nodemailer'
import type { Response } from 'express';
import { ApiError } from '../utils/Api.Error';
import { resetPasswordTable, usersTable } from '../models';

export const sendEmail = async (email: string, emailType: string, res: Response) => {
    try {

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

        if (!user) {
            console.error("No User found with this email to send OTP")
            return res.status(404).json(new ApiError(404, "No User found with this email to send OTP"));
        }

        const encryptedOtp = bcrypt.hashSync(otp, 10).toString();

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST!,
            secure: false,
            auth: {
                user: process.env.MAIL_USER!,
                pass: process.env.MAIL_USER_PASSWORD!,
            }
        });

        const mailOptions = {
            from: process.env.MAIL_USER!,
            to: email,
            subject: emailType === "VERIFY_EMAIL" ? "Verify your email" : "Reset your password",
            html: `<p>Your OTP code is ${otp}. It will expire in 5 minutes.</p>`
        }

        try {
            const mailResponse = await transporter.sendMail(mailOptions);

            if (!mailResponse) {
                return res.status(500).json(new ApiError(500, "Failed to send email"));
            }

            if (emailType === "forgotPassword") {
                await db.insert(resetPasswordTable).values({
                    userId: user?.id,
                    otp: encryptedOtp,
                    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
                })
            }

            return mailResponse;

        } catch (error) {
            console.error("Error sending Mail : ", error)
        }
    } catch (error) {
        console.error("Error validating with the mail : ", error);
        throw new ApiError(500, "Error validating with the mail")
    }
}