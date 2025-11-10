import type { NextFunction, Response } from "express"

export const isAdminRole = (role: 'user' | 'admin') => {
    return function (req: any, res: Response, next: NextFunction) {
        if (req.user && req.user.role !== role) {
            return res.status(403).json({ error: "Access denied. You are not authorized to access this resource." });
        }

        return next();
    }
}