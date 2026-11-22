import type { Request, Response, NextFunction } from "express";
import { getUserProfile, deleteUserAccount } from "./users.service.js";

/**
 * Controller to retrieve the authenticated user's profile.
 *
 * Route: GET /api/v1/users/me
 * Security: Bearer JWT
 */
export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    const user = await getUserProfile(userId);

    res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to permanently delete the authenticated user's account.
 *
 * Route: DELETE /api/v1/users/me
 * Security: Bearer JWT
 */
export async function deleteMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({
        message: "Authentication required",
      });
      return;
    }

    await deleteUserAccount(userId);

    // 204 No Content has no response body
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
