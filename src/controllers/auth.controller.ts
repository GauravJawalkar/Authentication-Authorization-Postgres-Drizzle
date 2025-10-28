import type { Request, Response } from "express";

const signup = async (req: Request, res: Response) => {
    try {
        return res.json({ data: "This is a signup controller" }).status(200);
    } catch (error) {
        return res.status(500).json({ message: "Failed to signup the user", error: error })
    }
}

const login = async (req: Request, res: Response) => {
    try {
        return res.json({ data: "This is a login controller" }).status(200);
    } catch (error) {
        return res.status(500).json({ message: "Failed to login the user", error: error })
    }
}

export { signup, login }