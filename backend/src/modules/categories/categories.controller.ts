import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  getUserCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addCategoryToReel,
  removeCategoryFromReel,
} from "./categories.service.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./categories.validation.js";

const uuidSchema = z.string().uuid("Invalid UUID format");

/**
 * Lists all categories owned by the user.
 *
 * Route: GET /api/v1/categories
 * Security: Bearer JWT
 */
export async function listCategoriesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const categories = await getUserCategories(userId);

    res.status(200).json({
      categories,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Creates a new topic category.
 *
 * Route: POST /api/v1/categories
 * Security: Bearer JWT
 */
export async function createCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const result = createCategorySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues,
      });
      return;
    }

    const category = await createCategory(userId, result.data);

    res.status(201).json({
      category,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Renames an existing category.
 *
 * Route: PATCH /api/v1/categories/:categoryId
 * Security: Bearer JWT
 */
export async function updateCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const paramResult = uuidSchema.safeParse(req.params.categoryId);
    if (!paramResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: paramResult.error.issues,
      });
      return;
    }

    const bodyResult = updateCategorySchema.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: bodyResult.error.issues,
      });
      return;
    }

    const category = await updateCategory(
      paramResult.data,
      userId,
      bodyResult.data,
    );

    res.status(200).json({
      category,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Deletes a category.
 *
 * Route: DELETE /api/v1/categories/:categoryId
 * Security: Bearer JWT
 */
export async function deleteCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const paramResult = uuidSchema.safeParse(req.params.categoryId);
    if (!paramResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: paramResult.error.issues,
      });
      return;
    }

    await deleteCategory(paramResult.data, userId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

/**
 * Assigns a Reel to a Category.
 *
 * Route: POST /api/v1/reels/:reelId/categories/:categoryId
 * Security: Bearer JWT
 */
export async function assignReelCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const reelIdResult = uuidSchema.safeParse(req.params.reelId);
    const categoryIdResult = uuidSchema.safeParse(req.params.categoryId);

    if (!reelIdResult.success || !categoryIdResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: [
          ...(reelIdResult.success ? [] : reelIdResult.error.issues),
          ...(categoryIdResult.success ? [] : categoryIdResult.error.issues),
        ],
      });
      return;
    }

    await addCategoryToReel(
      reelIdResult.data,
      categoryIdResult.data,
      userId,
    );

    res.status(200).json({
      message: "Reel successfully assigned to category",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Removes a Reel from a Category.
 *
 * Route: DELETE /api/v1/reels/:reelId/categories/:categoryId
 * Security: Bearer JWT
 */
export async function removeReelCategoryHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const reelIdResult = uuidSchema.safeParse(req.params.reelId);
    const categoryIdResult = uuidSchema.safeParse(req.params.categoryId);

    if (!reelIdResult.success || !categoryIdResult.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: [
          ...(reelIdResult.success ? [] : reelIdResult.error.issues),
          ...(categoryIdResult.success ? [] : categoryIdResult.error.issues),
        ],
      });
      return;
    }

    await removeCategoryFromReel(
      reelIdResult.data,
      categoryIdResult.data,
      userId,
    );

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
