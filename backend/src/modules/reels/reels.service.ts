import {
  findReelByNormalizedUrl,
  createReel,
  findReelByIdAndUserId,
  findReelsPaginated,
  updateReelByIdAndUserId,
  deleteReelByIdAndUserId,
} from "./reels.repository.js";
import { normalizeInstagramUrl } from "./reels.validation.js";
import type {
  CreateReelInput,
  UpdateReelInput,
  ReelsQueryInput,
  ReelRecord,
  PaginatedReelsResult,
} from "./reels.types.js";

export interface SaveReelResult {
  reel: ReelRecord;
  isDuplicate: boolean;
}

/**
 * Idempotently saves an Instagram Reel.
 *
 * Normalizes the URL and checks for an existing record for this user.
 * - If found: returns the existing record with `isDuplicate: true` (HTTP 200 OK).
 * - If new: creates the record and returns with `isDuplicate: false` (HTTP 201 Created).
 * - Handles concurrent race conditions via Prisma unique constraint P2002.
 */
export async function saveReel(
  userId: string,
  input: CreateReelInput,
): Promise<SaveReelResult> {
  const normalizedUrl = normalizeInstagramUrl(input.url);

  if (!normalizedUrl) {
    throw new Error("Invalid Instagram Reel URL");
  }

  // 1. Check if the user already saved this Reel
  const existingReel = await findReelByNormalizedUrl(userId, normalizedUrl);

  if (existingReel) {
    return {
      reel: existingReel,
      isDuplicate: true,
    };
  }

  // 2. Insert new record
  try {
    const newReel = await createReel({
      userId,
      url: input.url,
      normalizedUrl,
      caption: input.caption,
      thumbnailUrl: input.thumbnailUrl,
    });

    return {
      reel: newReel,
      isDuplicate: false,
    };
  } catch (error: unknown) {
    // Handle concurrent duplicate insertion attempts
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      const concurrentReel = await findReelByNormalizedUrl(userId, normalizedUrl);
      if (concurrentReel) {
        return {
          reel: concurrentReel,
          isDuplicate: true,
        };
      }
    }

    throw error;
  }
}

/**
 * Retrieves a paginated list of Reels for the user's library with filtering and sorting.
 */
export async function getReelsLibrary(
  userId: string,
  query: ReelsQueryInput,
): Promise<PaginatedReelsResult> {
  return findReelsPaginated(userId, query);
}

/**
 * Retrieves a single Reel by ID, strictly verifying user ownership.
 */
export async function getReelById(
  id: string,
  userId: string,
): Promise<ReelRecord> {
  const reel = await findReelByIdAndUserId(id, userId);

  if (!reel) {
    throw new Error("Reel not found");
  }

  return reel;
}

/**
 * Updates mutable fields of a saved Reel.
 */
export async function updateReel(
  id: string,
  userId: string,
  data: UpdateReelInput,
): Promise<ReelRecord> {
  const existing = await findReelByIdAndUserId(id, userId);

  if (!existing) {
    throw new Error("Reel not found");
  }

  return updateReelByIdAndUserId(id, userId, data);
}

/**
 * Permanently deletes a saved Reel, cascading to its notes and category/collection associations.
 */
export async function deleteReel(id: string, userId: string): Promise<void> {
  const existing = await findReelByIdAndUserId(id, userId);

  if (!existing) {
    throw new Error("Reel not found");
  }

  await deleteReelByIdAndUserId(id, userId);
}
