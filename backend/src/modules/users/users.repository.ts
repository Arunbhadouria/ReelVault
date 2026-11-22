import { prisma } from "../../database/prisma.js";
import type { UserProfile } from "./users.types.js";

/**
 * Finds a user by their primary key UUID.
 *
 * Uses an explicit field projection (`select`) so that sensitive data
 * such as `passwordHash` is never queried from the database engine.
 */
export async function findUserById(id: string): Promise<UserProfile | null> {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });
}

/**
 * Permanently deletes a user record by their ID.
 *
 * Thanks to `onDelete: Cascade` defined on all relational foreign keys
 * in PostgreSQL (reels, categories, collections, sessions, devices, tokens),
 * PostgreSQL automatically and transactionally removes all dependent records.
 */
export async function deleteUserById(id: string): Promise<UserProfile> {
  return prisma.user.delete({
    where: { id },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });
}
