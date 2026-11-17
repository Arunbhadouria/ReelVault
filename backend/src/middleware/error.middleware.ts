import type { Request, Response, NextFunction } from "express";

export function errorMiddleware(
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    console.error(error);

    if (error.message === "Email is already registered") {
        res.status(409).json({
            message: error.message,
        });
        return;
    }

    res.status(500).json({
        message: "Internal server error",
    });
}