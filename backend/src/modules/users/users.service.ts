import { findUserById, deleteUserById } from "./users.repository.js";
import type { UserProfile } from "./users.types.js";

/**
 * Retrieves the profile of an authenticated user.
 *
 * Verifies that the user record still exists in the database.
 * If the user has been deleted or deactivated, throws an error.
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

/**
 * Permanently deletes the account of an authenticated user.
 *
 * First verifies that the account exists. Then executes deletion,
 * which cascades through all dependent relational records in PostgreSQL.
 */
export async function deleteUserAccount(userId: string): Promise<void> {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  await deleteUserById(userId);
}
