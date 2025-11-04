import jwt from "jsonwebtoken";
import type { TokenUser } from "../interface/interface";

export const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET!
export const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET!

const generateAccessToken = (user: TokenUser) => {
    return jwt.sign(user, accessTokenSecret, { expiresIn: '5m' });
}

const generateRefreshToken = (user: TokenUser) => {
    return jwt.sign(user, refreshTokenSecret, { expiresIn: "7d" });
}

export { generateAccessToken, generateRefreshToken }