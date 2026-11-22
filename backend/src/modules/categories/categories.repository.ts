import { prisma } from "../../database/prisma.js";
import type { CategoryRecord } from "./categories.types.js";

/**
 * Finds a category by its name and owner.
 *
 * Backed by composite unique constraint: @@unique([userId, name])
 */
export async function findCategoryByNameAndUserId(
  userId: string,
  name: string,
): Promise<CategoryRecord | null> {
  const category = await prisma.category.findUnique({
    where: {
      userId_name: {
        userId,
        name,
      },
    },
  });

  return category;
}

/**
 * Inserts a new Category record for a user.
 */
export async function createCategory(
  userId: string,
  name: string,
): Promise<CategoryRecord> {
  return prisma.category.create({
    data: {
      userId,
      name,
    },
  });
}

/**
 * Retrieves all categories owned by a user, including the count of tagged reels.
 */
export async function findCategoriesByUserId(
  userId: string,
): Promise<CategoryRecord[]> {
  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { reels: true },
      },
    },
  });

  return categories.map((cat) => ({
    id: cat.id,
    userId: cat.userId,
    name: cat.name,
    isDefault: cat.isDefault,
    createdAt: cat.createdAt,
    reelsCount: cat._count.reels,
  }));
}

/**
 * Retrieves a single category by ID with ownership enforcement.
 *
 * Backed by composite unique constraint: @@unique([id, userId])
 */
export async function findCategoryByIdAndUserId(
  id: string,
  userId: string,
): Promise<CategoryRecord | null> {
  const cat = await prisma.category.findUnique({
    where: {
      id_userId: {
        id,
        userId,
      },
    },
    include: {
      _count: {
        select: { reels: true },
      },
    },
  });

  if (!cat) {
    return null;
  }

  return {
    id: cat.id,
    userId: cat.userId,
    name: cat.name,
    isDefault: cat.isDefault,
    createdAt: cat.createdAt,
    reelsCount: cat._count.reels,
  };
}

/**
 * Renames a category with ownership check.
 */
export async function updateCategoryByIdAndUserId(
  id: string,
  userId: string,
  name: string,
): Promise<CategoryRecord> {
  return prisma.category.update({
    where: {
      id_userId: {
        id,
        userId,
      },
    },
    data: {
      name,
    },
  });
}

/**
 * Deletes a category. Cascades to `ReelCategory` associations, leaving Reels intact.
 */
export async function deleteCategoryByIdAndUserId(
  id: string,
  userId: string,
): Promise<CategoryRecord> {
  return prisma.category.delete({
    where: {
      id_userId: {
        id,
        userId,
      },
    },
  });
}

/**
 * Associates a Reel with a Category in the junction table `ReelCategory`.
 * Uses upsert to guarantee idempotency.
 */
export async function assignReelToCategory(
  reelId: string,
  categoryId: string,
  userId: string,
): Promise<void> {
  await prisma.reelCategory.upsert({
    where: {
      reelId_categoryId: {
        reelId,
        categoryId,
      },
    },
    create: {
      reelId,
      categoryId,
      userId,
    },
    update: {},
  });
}

/**
 * Removes the association between a Reel and a Category in `ReelCategory`.
 */
export async function removeReelFromCategory(
  reelId: string,
  categoryId: string,
  userId: string,
): Promise<void> {
  await prisma.reelCategory.deleteMany({
    where: {
      reelId,
      categoryId,
      userId,
    },
  });
}
