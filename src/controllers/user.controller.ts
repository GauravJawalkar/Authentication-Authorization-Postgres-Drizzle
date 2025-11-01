import type { Request, Response } from "express";

const getUser = async (req: Request, res: Response) => {
    try {
        const userDetails = req.user;
        res.status(200).json({ message: "User Details", user: userDetails });
    } catch (error) {
        return res.status(500).json({ error: "Someting went wrong" });
    }
}

export { getUser }