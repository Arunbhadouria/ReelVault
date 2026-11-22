import { z } from "zod";
import { ReelStatus } from "../../generated/prisma/enums.js";

/**
 * Normalizes an Instagram Reel or Post URL to its canonical format:
 * https://www.instagram.com/reel/<shortcode>/
 *
 * Strips tracking query parameters (utm_*, igsh, etc.), trailing slashes,
 * and normalizes the host and path.
 */
export function normalizeInstagramUrl(rawUrl: string): string | null {
  const match = rawUrl.match(
    /(?:https?:\/\/)?(?:www\.|m\.)?instagram\.com\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/i,
  );

  if (!match || !match[1]) {
    return null;
  }

  return `https://www.instagram.com/reels/${match[1]}/`;
}

/**
 * Request validation schema for saving a Reel
 */
export const createReelSchema = z
  .object({
    url: z
      .string()
      .trim()
      .refine((val) => normalizeInstagramUrl(val) !== null, {
        message:
          "Invalid Instagram Reel URL. Must be an instagram.com link to a reel or post.",
      }),
    caption: z.string().trim().max(5000).optional(),
    thumbnailUrl: z.string().trim().url("Invalid thumbnail URL").optional(),
  })
  .strict();

/**
 * Request validation schema for updating editable Reel fields
 */
export const updateReelSchema = z
  .object({
    caption: z.string().trim().max(5000).nullable().optional(),
    thumbnailUrl: z.url("Invalid thumbnail URL").nullable().optional(),
    status: z.nativeEnum(ReelStatus).optional(),
  })
  .strict();

/**
 * Query parameter validation schema for listing Reels with pagination & filtering
 */
export const reelsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(ReelStatus).optional(),
  categoryId: z.uuid("Invalid category UUID").optional(),
  collectionId: z.uuid("Invalid collection UUID").optional(),
  sortBy: z.enum(["savedAt", "createdAt"]).default("savedAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});
