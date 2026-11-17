import { z } from "zod";

/**
 * Registration request validation schema
 *
 * Validation rules:
 * - email:
 *   - Required, string
 *   - Trim leading & trailing whitespace
 *   - Normalize to lowercase
 *   - Must be a valid email format
 *   - Maximum length of 254 characters (RFC 5321)
 *
 * - password:
 *   - Required, string
 *   - Minimum 12 characters, Maximum 128 characters
 *   - Kept verbatim (never trimmed or modified automatically)
 *
 * - strict():
 *   - Rejects any unrecognized or extra fields in the payload
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Invalid email format")
      .max(254, "Email must not exceed 254 characters"),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters long")
      .max(128, "Password must not exceed 128 characters"),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.email().trim().transform((email) => email.toLowerCase()),
    password: z.string().min(1, "Password is required").max(128),
  });

export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});