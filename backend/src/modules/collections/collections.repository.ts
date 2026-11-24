import { prisma } from "../../database/prisma.js";
import type {
  CollectionRecord,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "./collections.types.js";

/**
 * Finds a collection by its name and owner.
 *
 * Backed by composite unique constraint: @@unique([userId, name])
 */
export async function findCollectionByNameAndUserId(
  userId: string,
  name: string,
): Promise<CollectionRecord | null> {
  const collection = await prisma.collection.findUnique({
    where: {
      userId_name: {
        userId,
        name,
      },
    },
  });

  return collection;
}

/**
 * Inserts a new Collection record for a user.
 */
export async function createCollection(
  userId: string,
  data: CreateCollectionInput,
): Promise<CollectionRecord> {
  return prisma.collection.create({
    data: {
      userId,
      name: data.name,
      description: data.description ?? null,
    },
  });
}

/**
 * Retrieves all collections owned by a user, including the count of added reels.
 */
export async function findCollectionsByUserId(
  userId: string,
): Promise<CollectionRecord[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { reels: true },
      },
    },
  });

  return collections.map((col) => ({
    id: col.id,
    userId: col.userId,
    name: col.name,
    description: col.description,
    createdAt: col.createdAt,
    reelsCount: col._count.reels,
  }));
}

/**
 * Retrieves a single collection by ID with ownership enforcement.
 *
 * Backed by composite unique constraint: @@unique([id, userId])
 */
export async function findCollectionByIdAndUserId(
  id: string,
  userId: string,
): Promise<CollectionRecord | null> {
  const col = await prisma.collection.findUnique({
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

  if (!col) {
    return null;
  }

  return {
    id: col.id,
    userId: col.userId,
    name: col.name,
    description: col.description,
    createdAt: col.createdAt,
    reelsCount: col._count.reels,
  };
}

/**
 * Updates a collection's name and/or description.
 * Explicitly constructs updateData to satisfy exactOptionalPropertyTypes.
 */
export async function updateCollectionByIdAndUserId(
  id: string,
  userId: string,
  data: UpdateCollectionInput,
): Promise<CollectionRecord> {
  const updateData: {
    name?: string;
    description?: string | null;
  } = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  return prisma.collection.update({
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
 * Deletes a collection. Cascades to `CollectionReel` junction records, leaving Reels intact.
 */
export async function deleteCollectionByIdAndUserId(
  id: string,
  userId: string,
): Promise<CollectionRecord> {
  return prisma.collection.delete({
    where: {
      id_userId: {
        id,
        userId,
      },
    },
  });
}

/**
 * Associates a Reel with a Collection in the junction table `CollectionReel`.
 * Uses upsert to guarantee idempotency.
 */
export async function assignReelToCollection(
  reelId: string,
  collectionId: string,
  userId: string,
): Promise<void> {
  await prisma.collectionReel.upsert({
    where: {
      reelId_collectionId: {
        reelId,
        collectionId,
      },
    },
    create: {
      reelId,
      collectionId,
      userId,
    },
    update: {},
  });
}

/**
 * Removes the association between a Reel and a Collection in `CollectionReel`.
 */
export async function removeReelFromCollection(
  reelId: string,
  collectionId: string,
  userId: string,
): Promise<void> {
  await prisma.collectionReel.deleteMany({
    where: {
      reelId,
      collectionId,
      userId,
    },
  });
}
