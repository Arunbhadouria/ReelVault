import {
  findCategoryByNameAndUserId,
  createCategory as createCategoryRepo,
  findCategoriesByUserId,
  findCategoryByIdAndUserId,
  updateCategoryByIdAndUserId,
  deleteCategoryByIdAndUserId,
  assignReelToCategory,
  removeReelFromCategory,
} from "./categories.repository.js";
import { findReelByIdAndUserId } from "../reels/reels.repository.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryRecord,
} from "./categories.types.js";

/**
 * Creates a new category for the user, guaranteeing name uniqueness per user.
 */
export async function createCategory(
  userId: string,
  input: CreateCategoryInput,
): Promise<CategoryRecord> {
  const existing = await findCategoryByNameAndUserId(userId, input.name);

  if (existing) {
    throw new Error("Category name already exists");
  }

  try {
    return await createCategoryRepo(userId, input.name);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new Error("Category name already exists");
    }
    throw error;
  }
}

/**
 * Retrieves all categories belonging to the user.
 */
export async function getUserCategories(
  userId: string,
): Promise<CategoryRecord[]> {
  return findCategoriesByUserId(userId);
}

/**
 * Retrieves a single category by ID with ownership enforcement.
 */
export async function getCategoryById(
  id: string,
  userId: string,
): Promise<CategoryRecord> {
  const category = await findCategoryByIdAndUserId(id, userId);

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
}

/**
 * Renames an existing category, checking for name collisions.
 */
export async function updateCategory(
  id: string,
  userId: string,
  input: UpdateCategoryInput,
): Promise<CategoryRecord> {
  const existing = await findCategoryByIdAndUserId(id, userId);

  if (!existing) {
    throw new Error("Category not found");
  }

  if (input.name !== existing.name) {
    const duplicate = await findCategoryByNameAndUserId(userId, input.name);
    if (duplicate && duplicate.id !== id) {
      throw new Error("Category name already exists");
    }
  }

  try {
    return await updateCategoryByIdAndUserId(id, userId, input.name);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new Error("Category name already exists");
    }
    throw error;
  }
}

/**
 * Deletes a category with ownership verification.
 */
export async function deleteCategory(
  id: string,
  userId: string,
): Promise<void> {
  const existing = await findCategoryByIdAndUserId(id, userId);

  if (!existing) {
    throw new Error("Category not found");
  }

  await deleteCategoryByIdAndUserId(id, userId);
}

/**
 * Associates an existing Reel with an existing Category.
 * Strictly verifies ownership of both resources before creating the link.
 */
export async function addCategoryToReel(
  reelId: string,
  categoryId: string,
  userId: string,
): Promise<void> {
  const reel = await findReelByIdAndUserId(reelId, userId);
  if (!reel) {
    throw new Error("Reel not found");
  }

  const category = await findCategoryByIdAndUserId(categoryId, userId);
  if (!category) {
    throw new Error("Category not found");
  }

  await assignReelToCategory(reelId, categoryId, userId);
}

/**
 * Removes the association between a Reel and a Category.
 * Strictly verifies ownership of both resources before deleting the link.
 */
export async function removeCategoryFromReel(
  reelId: string,
  categoryId: string,
  userId: string,
): Promise<void> {
  const reel = await findReelByIdAndUserId(reelId, userId);
  if (!reel) {
    throw new Error("Reel not found");
  }

  const category = await findCategoryByIdAndUserId(categoryId, userId);
  if (!category) {
    throw new Error("Category not found");
  }

  await removeReelFromCategory(reelId, categoryId, userId);
}
