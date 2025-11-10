import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/Api.Error";
import jwt, { JsonWebTokenError, TokenExpiredError, type JwtPayload } from "jsonwebtoken";
import { generateAccessToken } from "../helpers/tokens";
import type { TokenUser } from "../interface/interface";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload | string;
        }
    }
}

export const verifyUserJwt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tokenHeader = req.headers.authorization;

        if (!req.user) {
            return res.status(401).json(new ApiError(401, "You must be authenticated"));
        }

        // Check if authorization header exists
        if (!tokenHeader) {
            return res.status(401).json(new ApiError(401, "Authentication token is required"));
        }

        // Check Bearer token format
        if (!tokenHeader.startsWith("Bearer ")) {
            return res.status(401).json(new ApiError(401, "Invalid token format. Token must start with 'Bearer '"));
        }

        const token = tokenHeader.split(" ")[1]?.trim();

        // Validate token existence
        if (!token) {
            return res.status(401).json(new ApiError(401, "Token is missing"));
        }

        // Validate JWT_SECRET environment variable
        if (!process.env.ACCESS_TOKEN_SECRET) {
            return res.status(500).json(new ApiError(500, "JWT_SECRET is not configured"));
        }

        try {
            const decodedUser = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.user = decodedUser;
            next();
        } catch (jwtError) {
            if (jwtError instanceof TokenExpiredError) {
                const refreshToken = req.cookies?.refreshToken;

                if (!refreshToken) return res.status(401).json({ error: "Login Again" });

                try {
                    const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as TokenUser;

                    const payload: TokenUser = {
                        id: user?.id,
                        name: user.name,
                        email: user.email,
                    }

                    const newAccessToken = generateAccessToken(payload);

                    res.setHeader("Authorization", `Bearer ${newAccessToken}`);

                    req.user = user;
                    return next();

                } catch (jwtError) {
                    if (jwtError instanceof TokenExpiredError) return res.status(401).json({ error: "Refresh Token Expired" });
                }

                return res.status(401).json({ error: "Token expired!" });
            }
            if (jwtError instanceof JsonWebTokenError) {
                return res.status(401).json({ error: "Invalid Token" });
            }
            throw jwtError;
        }

    } catch (error) {
        console.error("Internal server error during authentication : ", error)
        return res.status(500).json(new ApiError(500, "Internal server error during authentication"));
    }
}

