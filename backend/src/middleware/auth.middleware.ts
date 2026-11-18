import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../modules/auth/auth.token.js";

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Invalid authorization header",
            });
        }

        const userId = await verifyAccessToken(token);

        req.userId = userId;

        next();
    } catch {
        return res.status(401).json({
            message: "Invalid or expired access token",
        });
    }
}