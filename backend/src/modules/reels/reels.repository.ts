import { prisma } from "../../database/prisma.js";
import type { ReelStatus } from "../../generated/prisma/enums.js";
import type {
  ReelRecord,
  ReelsQueryInput,
  PaginatedReelsResult,
  UpdateReelInput,
} from "./reels.types.js";

/**
 * Finds an existing Reel for a specific user using its normalized URL.
 *
 * Backed by composite unique constraint: @@unique([userId, normalizedUrl])
 */
export async function findReelByNormalizedUrl(
  userId: string,
  normalizedUrl: string,
): Promise<ReelRecord | null> {
  return prisma.reel.findUnique({
    where: {
      userId_normalizedUrl: {
        userId,
        normalizedUrl,
      },
    },
  });
}

/**
 * Inserts a new Reel record for the user.
 */
export async function createReel(data: {
  userId: string;
  url: string;
  normalizedUrl: string;
  caption?: string | null | undefined;
  thumbnailUrl?: string | null | undefined;
}): Promise<ReelRecord> {
  return prisma.reel.create({
    data: {
      userId: data.userId,
      url: data.url,
      normalizedUrl: data.normalizedUrl,
      caption: data.caption ?? null,
      thumbnailUrl: data.thumbnailUrl ?? null,
    },
  });
}

/**
 * Retrieves a single Reel by its primary key ID, strictly enforcing user ownership.
 *
 * Backed by composite unique index: @@unique([id, userId])
 */
export async function findReelByIdAndUserId(
  id: string,
  userId: string,
): Promise<ReelRecord | null> {
  return prisma.reel.findUnique({
    where: {
      id_userId: {
        id,
        userId,
      },
    },
  });
}

/**
 * Retrieves a paginated list of Reels with multi-criteria filtering
 * and sorting, executing count and query in an atomic transaction.
 */
export async function findReelsPaginated(
  userId: string,
  query: ReelsQueryInput,
): Promise<PaginatedReelsResult> {
  const { page, limit, status, categoryId, collectionId, sortBy, order } = query;
  const skip = (page - 1) * limit;

  // Build type-safe where clause
  const where: any = {
    userId,
  };

  if (status) {
    where.status = status;
  }

  if (categoryId) {
    where.categories = {
      some: {
        categoryId,
        userId,
      },
    };
  }

  if (collectionId) {
    where.collections = {
      some: {
        collectionId,
        userId,
      },
    };
  }

  const [totalItems, items] = await prisma.$transaction([
    prisma.reel.count({ where }),
    prisma.reel.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

/**
 * Updates mutable fields of an existing Reel, strictly enforcing user ownership.
 *
 * Explicitly constructs the update payload to satisfy tsconfig's exactOptionalPropertyTypes.
 */
export async function updateReelByIdAndUserId(
  id: string,
  userId: string,
  data: UpdateReelInput,
): Promise<ReelRecord> {
  const updateData: {
    caption?: string | null;
    thumbnailUrl?: string | null;
    status?: ReelStatus;
  } = {};

  if (data.caption !== undefined) {
    updateData.caption = data.caption;
  }
  if (data.thumbnailUrl !== undefined) {
    updateData.thumbnailUrl = data.thumbnailUrl;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  return prisma.reel.update({
    where: {
      id_userId: {
        id,
        userId,
      },
    },
    data: updateData,
  });
}

/**
 * Deletes a Reel by ID and User ID. Cascades to notes, categories, and collection links.
 */
export async function deleteReelByIdAndUserId(
  id: string,
  userId: string,
): Promise<ReelRecord> {
  return prisma.reel.delete({
    where: {
      id_userId: {
        id,
        userId,
      },
    },
  });
}
