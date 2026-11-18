import type { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, refreshUserSession, logoutUser } from "./auth.service.js";
import { registerSchema, loginSchema, refreshTokenSchema } from "./auth.validation.js";

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

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const data = await loginUser(result.data);

    return res.status(200).json({
      message: "Login successful",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const result = refreshTokenSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    const data = await refreshUserSession(result.data.refreshToken);

    return res.status(200).json({
      message: "Token refreshed successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const result = refreshTokenSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    await logoutUser(result.data.refreshToken);

    return res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
}