import type { Request, Response, NextFunction } from "express";
import { registerUser } from "./auth.service.js";
import { registerSchema } from "./auth.validation.js";

export async function register(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const result = registerSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({
                message: "Validation Failed",
                errors: result.error.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message,
                })),
            });

            return;
        }

        // Register the user
        const user = await registerUser(result.data);

        // Send successful response
        res.status(201).json({
            message: "Registration successful",
            user,
        });
    } catch (error) {
        next(error);
    }
}