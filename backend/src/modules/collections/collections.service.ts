import {
  findCollectionByNameAndUserId,
  createCollection as createCollectionRepo,
  findCollectionsByUserId,
  findCollectionByIdAndUserId,
  updateCollectionByIdAndUserId,
  deleteCollectionByIdAndUserId,
  assignReelToCollection as assignReelToCollectionRepo,
  removeReelFromCollection as removeReelFromCollectionRepo,
} from "./collections.repository.js";
import { findReelByIdAndUserId } from "../reels/reels.repository.js";
import type {
  CreateCollectionInput,
  UpdateCollectionInput,
  CollectionRecord,
} from "./collections.types.js";

/**
 * Creates a new collection for the user, guaranteeing name uniqueness per user.
 */
export async function createCollection(
  userId: string,
  input: CreateCollectionInput,
): Promise<CollectionRecord> {
  const existing = await findCollectionByNameAndUserId(userId, input.name);

  if (existing) {
    throw new Error("Collection name already exists");
  }

  try {
    return await createCollectionRepo(userId, input);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new Error("Collection name already exists");
    }
    throw error;
  }
}

/**
 * Retrieves all collections belonging to the user.
 */
export async function getUserCollections(
  userId: string,
): Promise<CollectionRecord[]> {
  return findCollectionsByUserId(userId);
}

/**
 * Retrieves a single collection by ID with ownership enforcement.
 */
export async function getCollectionById(
  id: string,
  userId: string,
): Promise<CollectionRecord> {
  const collection = await findCollectionByIdAndUserId(id, userId);

  if (!collection) {
    throw new Error("Collection not found");
  }

  return collection;
}

/**
 * Updates a collection's name and/or description, guarding against duplicate name collisions.
 */
export async function updateCollection(
  id: string,
  userId: string,
  input: UpdateCollectionInput,
): Promise<CollectionRecord> {
  const existing = await findCollectionByIdAndUserId(id, userId);

  if (!existing) {
    throw new Error("Collection not found");
  }

  if (input.name && input.name !== existing.name) {
    const duplicate = await findCollectionByNameAndUserId(userId, input.name);
    if (duplicate && duplicate.id !== id) {
      throw new Error("Collection name already exists");
    }
  }

  try {
    return await updateCollectionByIdAndUserId(id, userId, input);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new Error("Collection name already exists");
    }
    throw error;
  }
}

/**
 * Deletes a collection with ownership verification.
 */
export async function deleteCollection(
  id: string,
  userId: string,
): Promise<void> {
  const existing = await findCollectionByIdAndUserId(id, userId);

  if (!existing) {
    throw new Error("Collection not found");
  }

  await deleteCollectionByIdAndUserId(id, userId);
}

/**
 * Associates an existing Reel with an existing Collection.
 * Strictly verifies ownership of both resources before creating the link.
 */
export async function addReelToCollection(
  reelId: string,
  collectionId: string,
  userId: string,
): Promise<void> {
  const reel = await findReelByIdAndUserId(reelId, userId);
  if (!reel) {
    throw new Error("Reel not found");
  }

  const collection = await findCollectionByIdAndUserId(collectionId, userId);
  if (!collection) {
    throw new Error("Collection not found");
  }

  await assignReelToCollectionRepo(reelId, collectionId, userId);
}

/**
 * Removes the association between a Reel and a Collection.
 * Strictly verifies ownership of both resources before deleting the link.
 */
export async function removeReelFromCollection(
  reelId: string,
  collectionId: string,
  userId: string,
): Promise<void> {
  const reel = await findReelByIdAndUserId(reelId, userId);
  if (!reel) {
    throw new Error("Reel not found");
  }

  const collection = await findCollectionByIdAndUserId(collectionId, userId);
  if (!collection) {
    throw new Error("Collection not found");
  }

  await removeReelFromCollectionRepo(reelId, collectionId, userId);
}
