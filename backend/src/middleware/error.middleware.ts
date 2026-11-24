import type { Request, Response, NextFunction } from "express";

export function errorMiddleware(
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
) {
    console.error(error);

    if (
        error.message === "Email is already registered" ||
        error.message === "Category name already exists" ||
        error.message === "Collection name already exists"
    ) {
        res.status(409).json({
            message: error.message,
        });
        return;
    }

    if (error.message === "Invalid Email or Password") {
        res.status(401).json({
            message: error.message,
        });
        return;
    }

    if (error.message === "Invalid refresh token" || error.message === "Refresh session expired or revoked" || error.message === "Refresh token is no longer valid") {
        res.status(401).json({
            message: error.message,
        });
        return;
    }

    if (
        error.message === "User not found" ||
        error.message === "Reel not found" ||
        error.message === "Category not found" ||
        error.message === "Collection not found" ||
        error.message === "Note not found"
    ) {
        res.status(404).json({
            message: error.message,
        });
        return;
    }

    if (error.message === "Invalid Instagram Reel URL") {
        res.status(400).json({
            message: error.message,
        });
        return;
    }

    res.status(500).json({
        message: "Internal server error",
    });
}