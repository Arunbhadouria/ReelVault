import type { z } from "zod";
import type {
  createReelSchema,
  updateReelSchema,
  reelsQuerySchema,
} from "./reels.validation.js";
import type {
  ReelStatus,
  AvailabilityStatus,
} from "../../generated/prisma/enums.js";

export type CreateReelInput = z.infer<typeof createReelSchema>;
export type UpdateReelInput = z.infer<typeof updateReelSchema>;
export type ReelsQueryInput = z.infer<typeof reelsQuerySchema>;

/**
 * Standard Reel representation returned across the API
 */
export interface ReelRecord {
  id: string;
  userId: string;
  url: string;
  normalizedUrl: string;
  caption: string | null;
  thumbnailUrl: string | null;
  status: ReelStatus;
  availabilityStatus: AvailabilityStatus;
  savedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pagination metadata format matching OpenAPI spec
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated library response shape
 */
export interface PaginatedReelsResult {
  items: ReelRecord[];
  pagination: PaginationMeta;
}
